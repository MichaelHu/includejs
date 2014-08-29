includejs
=========

a simple js loader for mobile webapp.

## 1. Module Declarations
modules are declared in head using link tag, example code below:

    <!-- all modules must be listed here -->
    <link rel="mod-include" data-mod="zepto" data-deps="" data-cache="1" href="./modules/zepto.pkg.js" />
    <link rel="mod-include" data-mod="common" data-deps="zepto" data-cache="1" href="./modules/common.js" />
    <link rel="mod-include" data-mod="index" data-deps="common" href="./modules/index.js" />
    <link rel="mod-include" data-mod="page" data-deps="common" href="./modules/page.js" />
    <link rel="mod-include" data-mod="init" data-deps="zepto" href="./modules/init.js" />

there are five attributes on link tag:

1. `rel`: must be `mod-include`
2. `data-mod`: module name
3. `data-deps`: dependent modules, a list separated by comma
4. `href`: modules uri
5. `data-cache`: specify whether the module is cached in client's localStorage

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

## 4. Script Pakage File

1. js package file format: 

        include(modName, "JSCONTENT");

2. example, content of file `index.js`:

        include('index', "console.log(\"index\")");

## 5. Examples

    <!DOCTYPE html>
    <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0" />

    <!-- all modules must be listed here -->
    <link rel="mod-include" data-mod="zepto" data-deps="" data-cache="1" href="./modules/zepto.pkg.js" />
    <link rel="mod-include" data-mod="common" data-deps="zepto" data-cache="1" href="./modules/common.js" />
    <link rel="mod-include" data-mod="index" data-deps="common" href="./modules/index.js" />
    <link rel="mod-include" data-mod="page" data-deps="common" href="./modules/page.js" />
    <link rel="mod-include" data-mod="init" data-deps="zepto" href="./modules/init.js" />

    <!-- invoke include.js after module declarations -->
    <script src="../src/include.js"></script>
    <script>include.setCacheKeyPrefix('news_phone');</script>

    <style type="text/css">
    .btn{
        padding: 5px;
        margin: 5px 0;
        border: 1px solid #999;
    }

    #tip{
        margin: 10px 5px;    
        color: #518aea;
        font: normal normal 14px/16px monospace;
    }
    </style>

        </head>
        <body>
    <div>
        <div class="btn" id="btn_go_index">Click to Go Index Page</div>
        <div class="btn" id="btn_go_detail">Click to Go Detail Page</div>
        <div id="tip"></div>
    </div>
        </body>
        <script>
            include('init', function(){
                console.log('rocket.init 1')
            });

            include('init', function(){
                console.log('rocket.init 2')
            });

            include('init', function(){
                console.log('rocket.init 3')

                $('#btn_go_index').on('click', function(){
                    include('index', function(){
                        console.log('go index'); 
                        $('#tip')[0].innerHTML += 'go index<br>';     
                    }); 
                });

                $('#btn_go_detail').on('click', function(){
                    include('page', function(){
                        console.log('go detail'); 
                        $('#tip')[0].innerHTML += 'go detail<br>';     
                    }); 
                });
            });
            
        </script>
    </html>
