# slappCMS micro Content Management System
## Versionnumber 2.2.0 (2017-04-23) Beta
(***Documentation last update 2017-04-23 17:30***)  

Lightweight Content Managment System, that is easy adaptable. Designed for Webapps and small Websites.

## Features
* multiple masterpages
* selfdefined Slugs / paths (one level)
* fileupload
* content store
  * database
  * filesystem
* database setup scripts
* editable
  * content
  * systempages
* basic forms creation and usage

## Roadmap / Future Features
* forms security
* testing
* Code refactoring / Cleanup
* documentation
  * jsdoc
  * mini manual
  * UI - Tooltips
* SEO optimization

## Known Bugs
* textarea error in edit page

## Usage

## Setup
* clone Source from github 
* change into the folder and execute `npm install`.  
* set postgreSql connectionstring Enviroment Variable `DATABASE_URL`

## SourceControl Link & Information
git@github.com:akumagamo/node-slapp-cms.git

## Documentation
*... Enter User Manual Link here ... WIP *

### File / Folder Structure

     +-+- slapp-cms
       +-+- out
       | +-+- .bin
       | | +-- slapp-cms.js
       | +-- ...
       +-+- documents
       | +-+- jsdoc  (output directory for jsdoc script)
       | | +-- ...
       | +-- ...
       +-+- logs (logfile default folder)
       | +-- ...
       +-+- source
       | +-+- node_modules (needed libs etc.)
       | | +-- ...
       | +-+- tests
       | | +-+- features
       | | | +-+- step_definitions
       | | |   +-- demo_steps.js (demo step_definition file)
       | | |   +-- ...
       | | +-+- support_files
       | | | +-- ...
       | | +-- demo.feature (demo feature file)
	     | | +-_ ...
       | +- index.js 
       +-- readme.md (this document)
       +-- package.json
       +-- LICENSE

### External Libs
* **pg npm module** for the database connection with postgreSql.



/* export PATH=$PATH:/g/00_programs/phantomjs-2.1.1/bin */

http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/
