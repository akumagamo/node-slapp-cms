# slappCMS micro Content Management System
## Versionnumber 2.0.0 (2017-03-29) Beta
(***Documentation last update 2017-03-29 13:00***)  

Lightweight Content Managment System, that is easy adaptable. Designed for Webapps and small Websites.

## Features
* multiple masterpages
* selfdefined Slugs / paths (one level)
* fileupload
* content stored in database
* database setup scripts
* editable
  * content
  * systempages
* basic forms creation and usage

## Roadmap / Future Features
* forms security
* content stored in filesystem
* testing
* documentation
  * jsdoc
  * mini manual
  * UI - Tooltips
* SEO optimization

## Known Bugs
* none

## Usage

## Setup
* download / clone Source from github 
* change into the folder and execute `npm install`.  
* set postgreSql connectionstring Enviroment Variable `DATABASE_URL`

## SourceControl Link & Information
git@github.com:akumagamo/...

## Documentation
*... Enter User Manual Link here ...*

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