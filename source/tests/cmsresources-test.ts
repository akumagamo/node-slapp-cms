/*import * as assert from 'assert';

import { DatabaseConnector } from '../libs/dataconnector/databaseconnector';

import { CMSResources } from '../libs/cmsresources';
import { ICMSResource } from '../libs/cmsresource';


describe("CMSResources class", function() {
  describe("#getResource()", function () {
    this.timeout(10000);

    before("setup connection", function (done) {
        let connector = new DatabaseConnector();
        this.resourcesLoader = new CMSResources(connector);
        done();
    });

    it("should return a the ROOT PAGE", function (done) {
        let promise = this.resourcesLoader.getResource("", "GET", false);
        promise.then(
            function(resource: ICMSResource){
                assert.equal(resource.slug, "")
                assert.equal(resource.mimeType, "text/html")
                done();
            },
            (x:any) => console.info(x)
        );
    });

    it("should return throw Error", function (done) {
        let promise = this.resourcesLoader.getResource("/qwerwqerqwrwqe", "GET", false);
        promise.then(
            function(resource: ICMSResource){
                assert.throws(( ) => {
                    assert.equal(resource.slug, "qwerwqerqwrwqe");
                },"");
                done();
            }
        );
    });

    it("should return NOT FOUND PAGE", function (done) {
        let that = this;
        let promise = that.resourcesLoader.getResource("/qwerwqerqwrwqe", "GET", false);
        promise.then(
                (resource: ICMSResource) => resource.slug
            ).catch(
                () => that.resourcesLoader.getResource("_error_not_found", "GET")
            ).then(
                (resource: ICMSResource) => {
                    assert.equal(resource.slug, "_error_not_found");
                    done();
                }
            );
    });
  });
});*/
