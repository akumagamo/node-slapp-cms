export namespace CMSBase {
    export  const ResourceTypes = {
        "SYSTEM_PAGE" : "systempage",
        "PAGE" : "page",
        "MASTER_PAGE" : "masterpage",
        "BINARY" : "binary",
        "UPLOAD" : "upload",
        "FORM" : "form" 
    };

    export const MimeTypes: any = {
        "DEFAULT" : "text/html",
        "HTML" : "text/html",
        "CSS" : "text/css",
        "JAVASCRIPT" : "text/javascript",
        "JSON" : "application/json",
        "JPEG" : "image/jpeg",
        "PNG" : "image/png",
        "ICO" : "image/x-icon",
        "SVG" : "image/svg+xml"
    }

    export const SystemPages: any = {
        "UPLOAD" : "_upload",
        "LOGIN" : "_login",
        "ERROR" : "_error",
        "ERROR_NOT_FOUND" : "_error_not_found",
        "SETTINGS" : "_edit",
      //  "MASTER_PAGE" : "masterpage",
        "EDIT" : "_edit",
        "ADDIN_PAGE_IS_LOADED" : "_addin_page_is_loaded",
        "ADDIN_BACKEND_BUTTONS" : "_addin_backend_buttons"
    }
}