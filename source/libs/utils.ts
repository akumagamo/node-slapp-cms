import * as fs from 'fs';

export namespace Utils {
    export function generateRandomId(): string {
        return Math.random().toString(26).replace(/\d|\./gi, "");
    }

    export function getBackendStaticFiles(filename:string) : string{
        return fs.readFileSync(__dirname + "/../backend/" + filename, "utf8"); 
    }

    export function trim(text : string, char? : string) : string {
        char = char || "\\s";
        return text.replace(new RegExp("^" + char + "*", "i"), "").replace(new RegExp(char + "*$", "i"), "");
    }

    export function assign(...objects:Object[]):any{
        return (<any>Object).assign.apply(null,objects);
    }

    function findIndex(binary:any, needle:string, startIndex:number) : number{
        let index = -1;
        let found : boolean = false;
        let counter : number = startIndex;
        let needleBinary : Buffer = new Buffer(needle);

        while(found === false && binary.length > counter ) {        
            
            if(binary[counter] === needleBinary[0]){
                index = counter;
                for (var idx = 0; idx < needleBinary.length; idx++) {
                   found = binary[counter + idx] === needleBinary[idx];
                   if(found===false){
                       index = -1;
                       break;
                   }
                }
            }
            counter++;
        }
        return index;
    }

    function processDataChunk(binary:any) : any {
        let seperator = "\r\n\r\n";
        let firstPosition = findIndex(binary, seperator, 0) + Buffer.byteLength(seperator);
        let headerContent = binary.slice(0, firstPosition).toString("utf-8");
        let header = parseHeader(headerContent);
        let body = binary.slice(firstPosition, binary.length - 2);
        
        if(header["content-type"] === undefined){
            body = body.toString("utf-8");
        }

        return {
            name : header["Content-Disposition"]["name"],
            header: header,
            body: body
        };
    }

    export function processDataChunks(binary:any, boundary:string) : any{
        let done : boolean = false;
        let firstIndex : number = 0;
        let lastIndex : number = 0;
        let result : any = {};

        while (done === false) {
            firstIndex = findIndex(binary, boundary, lastIndex) + Buffer.byteLength(boundary);
            lastIndex = findIndex(binary, boundary, firstIndex);
            done = firstIndex > lastIndex;
            if(done === false){
                let obj = processDataChunk(binary.slice(firstIndex, lastIndex));
                result[obj.name] = obj;
            }
        }

        return result;
    }

    function parseHeader(contentPart: string){
        let result : any = {};
        let headerParts = contentPart.split("\r\n");
        
        for (let headerPart of headerParts) {          
            let headers = headerPart.split(":");

            if(headers.length < 2) {
                continue
            }
            console.info("H",headers[0],headers[1])
            if(headers[0].toLowerCase() === "content-type"){
                result["content-type"] = Utils.trim(headers[1]);
            } else { 
                result[headers[0]] = parseHeaderPart(headers[1]);
            }            
        }
        return result;
    }

    function parseHeaderPart(headerParts : string) : any {
        console.info(headerParts);
        return headerParts.split(";").reduce(
            (last : any, next : any) => {
                let x = next.split("=").map(
                    (v:any) => Utils.trim(Utils.trim(v,"\""))
                );
                let obj : any = {};
                if(x.length===2){
                    last[x[0]] = x[1];
                } else {
                    last[x[0]] = x[0];
                }
                return last;
            }, {}
        );
    }
}