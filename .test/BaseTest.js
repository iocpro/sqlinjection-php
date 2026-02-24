const {Builder, Browser, By, Key, until} = require("selenium-webdriver");
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');
const { spawn, spawnSync } = require("child_process");
const assert = require('assert');


class BaseTest {

    constructor() {
        console.log("Constructing...")
        this.headless = process.env.HEADLESS=="false" ? false : true;
        this.browser = process.env.CHROME_TESTS ? "chrome" : "firefox";
        this.cmd = null;
        this.driver = null;
    }
    
    async setUp() {
        console.log("HEADLESS:"+this.headless);
        console.log("BROWSER:"+this.browser);

        // run server and setup driver
        await this.runServer( "../run", [] );
        await this.setupDriver();

        console.log("Reiniciant DB...");
        await this.runServer( "../initdb", [] );

        // deixem temps a que el servidor es posi en marxa
        //await this.driver.sleep(2000);
    }

    async tearDown() {

        // No parem el servidor, es massa lent
        // Ara reiniciem la DB
        //console.log("Closing server...");
        // parem server
        //await this.runServer( "../stop", [] );
        
        //await this.killServer(); // Deprecated!
        // deixem temps perquè es tanquin els processos
        //await this.driver.sleep(2000);
        // tanquem browser
        console.log("Closing Selenium driver...");
        await this.driver.quit();
    }

    async run() {
        let error = 0; // no error
        console.log("running setUp...");
        await this.setUp();
        try {
            console.log("running test...");
            await this.test();
        } catch (err) {
            // error detected
            error = err;
            console.error(err);
        } finally {
            console.log("running tearDown...");
            await this.tearDown();
            if( error ) {
                throw error;
                return error;
            }
            return 0;
        }
        return "ERROR in run";
    }

    async test() {
        console.log("Empty test!");
    }

    async setupDriver() {
        let firefoxOptions = new firefox.Options();
        let chromeOptions = new chrome.Options();
        if( this.headless ) {
            console.log("Running Headless Tests...");
            firefoxOptions = new firefox.Options().addArguments('-headless');
            chromeOptions = new chrome.Options().addArguments('--headless=new');
        }
        if( this.browser=="chrome" ) {
            this.driver = await new Builder()
                .forBrowser(Browser.CHROME)
                .setChromeOptions(chromeOptions)
                .build();
        } else {
            this.driver = await new Builder()
                .forBrowser(Browser.FIREFOX)
                .setFirefoxOptions(firefoxOptions)
                .build();
        }
    }

    runServer( command, options ) {
        // Engeguem server amb la APP
        let resultat = null;
        if( process.platform=="win32" ) {
            resultat = spawnSync(command+".bat",options,{shell:true,encoding:'utf8'});
        } else {
            // linux, macos (darwin), or other
            resultat = spawnSync(command+".sh",options,{encoding:'utf8'});
        }
        // deprecated?
        //this.cmd = app;
        console.log("RUN SERVER =====================================");
        console.log("EXIT STATUS: "+resultat.status);
        console.log("STDOUT ----------------------------");
        console.log(resultat.stdout);
        console.log("STDOUT ----------------------------");
        console.log(resultat.stderr);
        console.log("-----------------------------------");

        return resultat;
    }

    async killServer() {
        // tanquem servidor
        if( process.platform=="win32" ) {
            spawnSync("taskkill", ["/pid", this.cmd.pid, '/f', '/t']);
        } else {
            // Linux, MacOS or other
            await this.cmd.kill("SIGHUP")
        }
    }

}

// publiquem l'objecte BaseTest
exports.BaseTest = BaseTest;