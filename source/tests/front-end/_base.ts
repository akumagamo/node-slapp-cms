import * as assert from 'assert';
import * as webdriver from 'selenium-webdriver';

let packageCofing = require('../../package.json');

describe("Website Smoketests", function() {
    this.timeout(20000);
    let driver: webdriver.ThenableWebDriver;
    let By = webdriver.By;
    let until = webdriver.until;

    let user = "admin";
    let password = "slapp$5";

    let domain: string = "http://www.slapp.at/";
    
    before(function () {
        driver = new webdriver.Builder()
            .withCapabilities({"phantomjs.binary.path": packageCofing.config.test.phantomjsPath})
            .forBrowser("phantomjs")
            .build();
    });

    describe.skip("static Pages", function(){
        describe("base Pages", function () {
            it("has home", function (done) {
                driver.get(domain).then(function () {
                    driver.getTitle().then(function (title) {
                        assert.equal("", title);
                        done();
                    });
                });
            });

            it("has not found", function (done) {
                driver.get(domain + Math.random()).then(function () {
                    driver.findElement(By.xpath("//body")).then(function(element){
                        element.getText().then(function(body){
                            assert.equal("Not Found", body);
                            done();
                        });
                    });
                });
            });

            it("has login", function(done) {
                driver.get(`${domain}?login`).then(function () {
                    driver.getTitle().then(function (title) {
                        assert.equal("Login Page", title);
                        done();
                    });
                });
            });
        });
    });

    describe("dynamic Pages", function(){
        describe("login Case", function () {
            it("?login", function (done) {
                driver.get(`${domain}?login`).then(function () {
                    driver.getTitle().then(function (title) {
                        assert.equal("Login Page", title);
                        driver.manage().getCookies().then(function () {
                            done();
                        });         
                    });
                });
            });

            describe("successful Login", function () {

                beforeEach(function () {
                    return driver.manage().deleteAllCookies().then(() =>
                        driver.get(`${domain}?login`).then(function () {
                            driver.findElement(By.id("username")).sendKeys(user);
                            driver.findElement(By.id("password")).sendKeys(password);
                            driver.findElement(By.xpath("//button")).click();
                        })
                    );
                });

                it("should set www.slapp.at cookie", function (done) {
                    driver.manage().getCookies().then(function(cookies){
                        cookies = cookies.filter( x=> new RegExp(x.domain).test(domain));
                        assert.equal(cookies.length, 1);
                        done();
                    });
                });

                it("should redirect to home page", function (done) {
                    driver.getTitle().then(function (title) {
                        assert.equal("", title);
                        done();
                    });
                });

            });

        });

        describe.skip("authorised access", function() {

             it("?login should logout", function (done) {
                driver.get(`${domain}?login`).then(function () {
                    driver.getTitle().then(function (title) {
                        assert.equal("Login Page", title);
                        driver.manage().getCookies().then(function () {
                            done();
                        });         
                    });
                });
            });

            describe.skip("upload file", function() {
                beforeEach(function () {
                    return driver.manage().deleteAllCookies().then(() =>
                        driver.get(`${domain}?login`).then(function () {
                            driver.findElement(By.id("username")).sendKeys(user);
                            driver.findElement(By.id("password")).sendKeys(password);
                            driver.findElement(By.xpath("//button")).click();
                        })
                    );
                });
                
                it("upload file", function(done) {
                    driver.get(`${domain}?upload`).then(function(){
                        let newTitel = "test_img" + Math.random();
                        driver.findElement(By.id("value")).sendKeys(newTitel);
                        driver.findElement(By.id("upload")).sendKeys("helper.png");
                        driver.findElement(By.xpath("//button")).click();
                        driver.getTitle().then(function (title) {
                            assert(new RegExp(newTitel).test(title));
                            done();
                        });
                    });
                });
            });

            describe("edit page", function() {
                describe("edit auth", function() {
                    beforeEach(function() {
                        return driver.manage().deleteAllCookies().then(() =>
                            driver.get(`${domain}?login`).then(function () {
                                driver.findElement(By.id("username")).sendKeys(user);
                                driver.findElement(By.id("password")).sendKeys(password);
                                driver.findElement(By.xpath("//button")).click();
                            })
                        );
                    });

                    it("edit page", function(done) {
                        driver.get(`${domain}testpage.html?edit`).then(() => {
                            driver.findElement(By.id("value")).sendKeys("<head><title>testpage</title></head><body></body>");
                            driver.findElement(By.css("#parentResourceId option:nth-child(1)")).click();
                            driver.findElement(By.id("resourceType")).sendKeys("page");
                            driver.findElement(By.xpath("//button")).click();
                            driver.getTitle().then(function (title) {
                                assert.equal(title, "testpage");
                                done();
                            });
                        });
                    });

                    it.skip("edit masterpage", function(done) {
                        driver.get(`${domain}testpage.html?setting`).then(() => {
                            driver.findElement(By.css("#parentResourceId option:checked"))
                                .getAttribute("value").then((value: string) => {
                                    assert.equal(value, "19");
                                    done();
                                });
                        });
                    });

                    it.skip("edit form_item", function(done) {
                        done();
                    });

                    it.skip("cancel", function(done) {
                        done();
                    });

                });
            });

            describe("form items", function() {
                describe("form_item auth", function() {
                    beforeEach(function () {
                        return driver.manage().deleteAllCookies().then(() =>
                            driver.get(`${domain}?login`).then(function () {
                                driver.findElement(By.id("username")).sendKeys(user);
                                driver.findElement(By.id("password")).sendKeys(password);
                                driver.findElement(By.xpath("//button")).click();
                            })
                        );
                    });

                    it("form_item create", function(done) {
                        driver.get(`${domain}test-form-ui`).then(() => {
                            driver.findElement(By.id("email")).sendKeys("test@test.tt");
                            driver.findElement(By.xpath("//button")).click();
                            driver.sleep(3000).then(function(){
                                
                                driver.findElement(By.id("message"))
                                    .getAttribute("innerText")
                                    .then(function(text){
                                        assert.equal(text, "SUCCESS");
                                        done();
                                });

                            });
                        });
                    });

                it("form_item create invalid", function(done) {
                        driver.get(`${domain}test-form-ui`).then(() => {
                            driver.findElement(By.id("email")).sendKeys("test@test");
                            driver.findElement(By.xpath("//button")).click();
                            driver.findElement(By.id("message")).getText().then(function (text) {
                                assert.equal(text, "ERROR");
                                done();
                            });
                        });
                    });

                    it.skip("form_item read", function(done) {

                    });

                    it.skip("form_item update", function(done) {

                    });

                    it.skip("form_item delete", function(done) {

                    });
                });
            });

            describe.skip("form_item", function() {

                it("create");

                it("read");

                it("update");

                it("delete");
            });

        });
        
        describe.skip("unauthorised access", function() {

            beforeEach(function () {
                return driver.manage().deleteAllCookies();
            });

            it("upload file", function(done) {
                driver.get(`${domain}?upload`).then(function(){
                    driver.getTitle().then(function (title) {
                        driver.findElements(By.id("value")).then(elements=>{
                            assert.equal(elements.length, 0 );
                            assert.equal(title, "");
                            done();
                        });
                    });
                });
            });

            it("edit file", function(done) {
                    driver.get(`${domain}?edit`).then(function(){
                        driver.getTitle().then(function (title) {
                            driver.findElements(By.id("value")).then(elements=>{
                                assert.equal(elements.length, 0 );
                                assert.equal(title, "");
                                done();
                            });
                        });
                    });
            });
        });
    });

});

