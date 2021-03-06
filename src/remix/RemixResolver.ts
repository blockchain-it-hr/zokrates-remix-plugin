import { Resolver, ResolverResult } from "../common/types";
import { remixClient } from "./RemixClient";
import { getImportPath } from "../common/utils";

export interface Imports {
  [location: string]: string;
}

export default class RemixResolver implements Resolver {
  imports: Imports = {};
  private reserved: Array<string> = ["ecc/", "signature/", "hashes/", "utils/"];

  prefetchImports = async (location: string, source: string) => {
    let regex = /^\s*(?:import|from)\s*[\'\"]([^\'\"]+)[\'\"]/gm;
    let match: any;

    while ((match = regex.exec(source))) {
      let path: string = match[1];
      let stdlib = this.reserved.some((r) => path.startsWith(r));

      if (!stdlib) {
        let result = await this.resolve(location, path);
        this.imports = {
          ...this.imports,
          [result.location]: result.source,
        };
        await this.prefetchImports(result.location, result.source);
      }
    }
  };

  resolve = (
    currentLocation: string,
    importLocation: string
  ): Promise<ResolverResult> => {
    return new Promise<ResolverResult>(async (resolve, reject) => {
      try {
        let location = getImportPath(currentLocation, importLocation);
        let source = await remixClient.getFile(location);
        resolve({ source: source, location: location } as ResolverResult);
      } catch (error) {
        reject(error);
      }
    });
  };
}

export const remixResolver = new RemixResolver();
