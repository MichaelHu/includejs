includejs
=========

a simple js loader for mobile webapp.

## 1. Module Declarations
modules are declared in head using link tag, example code below:

    <!-- all modules must be listed here -->
    <link rel="mod-include" data-mod="zepto" data-deps="" data-localize="1" href="./modules/zepto.pkg.js" />
    <link rel="mod-include" data-mod="common" data-deps="zepto" data-localize="1" href="./modules/common.js" />
    <link rel="mod-include" data-mod="index" data-deps="common" href="./modules/index.js" />
    <link rel="mod-include" data-mod="page" data-deps="common" href="./modules/page.js" />
    <link rel="mod-include" data-mod="init" data-deps="zepto" href="./modules/init.js" />

there are five attributes on link tag:

1. `rel`: must be `mod-include`
2. `data-mod`: module name
3. `data-deps`: dependent modules, a list separated by comma
4. `href`: modules uri
5. `data-localize`: specify whether the module is cached in client's localStorage

## 2. Import includejs
immediately after module declarations, `include.js` is import using script tag. example code goes below:
    
    <script src="../src/include.js"></script>

## 3. APIs
1. `include`
  * `include(modName, jsText)`: executed when script pakage is loaded from remote server
  * `include(modName, callback)`: executed from client call
  * `include(modName)`: the same as `include(modName, callback)`, except that callback is `undefined`
2. `include.setCacheKeyPrefix`
  * default `CACHE_KEY_PREFIX` is ''

## 4. Examples

    
