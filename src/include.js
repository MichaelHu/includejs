window.include = (function(options){

var CACHE_KEY_PREFIX = '';
var IS_LOCALSTORAGE_ENABLED = true;

try{ 
    localStorage.setItem('test_includejs_cache','test'); 
} 
catch(e){ 
    IS_LOCALSTORAGE_ENABLED = false;
}

function include(modName, content){
    if('object' == typeof modName
        && modName.length > 0){
        _addMultiModsCallback(modName, content);
        for(var i=0; i<modName.length; i++){
            _include(modName[i]);
        }
    }
    else{
        _include(modName, content);
    }
}


function _include(modName, content){

    // script loaded from remote server
    if('string' == typeof content){
        if(_isDepsReady(modName)){
            _exec(modName, content);
            _afterExec();
        }    
        else{
            _wait(modName, content);
        }
    }

    // from client call, content is function or undefined
    else{
        var callback = content;
        if(!_isDepsReady(modName)){
            _includeDeps(modName);
        }
        _add(modName, callback);
        _load(modName);
    }

}

include._mods = {};
include._multiModsCallback = [];
include.setCacheKeyPrefix = function(prefix){
    CACHE_KEY_PREFIX = prefix || '';
};






function _load(modName){
    var mod = include._mods[modName],
        cache;
    if(!mod){
        console.log('no mod defininition');
        return;
    }

    if('INIT' != mod.state){
        return;
    }

    mod.state = 'LOADING';
    cache = _getCache(modName);
    if(cache){
        // console.log('cache: ' + cache);
        _include(modName, cache);
    }
    else{
        _get_script(mod.uri);
    }
}

function _add(modName, callback){
    var mod = include._mods[modName];
    if(!mod){
        console.log('no mod defininition');
        return;
    }

    /**
     * multi-call include(modName, callback)
     * will result in multi-call of callback
     */
    if('function' == typeof callback){
        mod.callback.push({
            done: false
            , func: callback
        });
    }

    if('LOADED' == mod.state){
        _callback(modName);
        _execMultiModsCallback(modName);
    }
}

function _callback(modName){
    var mod = include._mods[modName],
        callbacks;
    if(!mod){
        console.log('no mod defininition');
        return;
    }
   
    callbacks = mod.callback; 
    for(var i=0; i<callbacks.length; i++){
        if('function' == typeof callbacks[i].func
            && !callbacks[i].done){
            callbacks[i].func.apply(window);
            callbacks[i].done = true;
        }
    }
}






function _exec(modName, content){
    var mod = include._mods[modName];
    if(!mod){
        console.log('no mod defininition');
        return;
    }

    if('LOADED' == mod.state){
        return; 
    }
    else{
        window.eval(content);
        mod.state = 'LOADED';
        mod.content = content;
        _callback(modName);
        _execMultiModsCallback(modName);
        if(mod.localize){
            setTimeout(function(){
                _setCache(modName, content);
            }, 0);
        }
    }
}

function _afterExec(){
    var mods = include._mods,
        mod;

    for(var i in mods){
        mod = mods[i];
        if('WAIT' == mod.state){
            if(_isDepsReady(i)){
                _exec(i, mod.content);
            }
        }
    }
}

function _wait(modName, content){
    var mod = include._mods[modName];

    if(!mod){
        console.log('no mod defininition');
        return;
    }

    if('LOADED' == mod.state){
        return;
    }

    mod.state = 'WAIT';
    mod.content = content;
}








function _get_script(url, callback){
    var script = document.createElement('script');

    script.addEventListener('load', function(e){
        script.removeEventListener('load');
        script.parentNode.removeChild(script);
        'function' == typeof callback && callback();
    }, false);

    script.src = url; 
    document.head.appendChild(script);
}

function _initMods(){
    var links = document.getElementsByTagName('LINK'),
        link,
        mod,
        uri,
        localize,
        deps;    

    for(var i=0; i<links.length; i++){
        link = links[i]; 
        if('mod-include' == link.rel){
            deps = link.getAttribute('data-deps'); 
            deps = deps.replace(/\s/g, '');

            uri = link.getAttribute('href');
            mod = link.getAttribute('data-mod');
            localize = link.getAttribute('data-localize') || 0;
            include._mods[mod] = {
                uri: uri 
                , deps: !deps ? [] : deps.split(',')
                , state: 'INIT'
                , localize: localize
                , callback: []
            };
        }
    }
}

function _getDeps(modName){
    var mod = include._mods[modName],
        deps;
    if(!mod){
        console.log('no mod defininition');
        return null;
    }
    deps = mod.deps;
    return deps;
}

function _includeDeps(modName){
    var deps = _getDeps(modName);

    if(!deps){
        return; 
    }

    for(var i=0; i<deps.length; i++){
        if(_isInit(deps[i])){
            _include(deps[i]);
        } 
    }
}

function _isInit(modName){
    var mod = include._mods[modName];
    if(!mod){
        console.log('no mod defininition');
        return true;
    }
    return 'INIT' == mod.state;
}

function _isReady(modName){
    var mod = include._mods[modName];
    if(!mod){
        console.log('no mod defininition');
        return true;
    }
    return 'LOADED' == mod.state;
}

function _isDepsReady(modName){
    var deps = _getDeps(modName);

    if(!deps){
        return true; 
    }

    for(var i=0; i<deps.length; i++){
        if(!_isReady(deps[i])){
            return false;
        } 
    }
    return true;
}






function _addMultiModsCallback(modList, callback){
    var arr = include._multiModsCallback;

    if('function' != typeof callback){
        return;
    } 

    arr.push({
        done: false 
        , func: callback
        , deps: modList
    });
}

function _execMultiModsCallback(modName){
    var mod = include._mods[modName],
        arr = include._multiModsCallback,
        item, deps, isReady;

    if(!mod){
        console.log('no mod defininition');
        return;
    }

    for(var i=0; i<arr.length; i++){
        item = arr[i];
        if(item.done){
            continue;
        }
        
        deps = item.deps; 
        isReady = true;
        for(var j=0; j<deps.length; j++){
            if(!_isReady(deps[j])){
                isReady = false;
                break;
            }
        } 

        if(isReady){
            if('function' == typeof item.func){
                item.func.apply(window);
                item.done = true;
            }
        }
    }
}






function _getMD5(uri){
    var rMD5 = /.+_([0-9a-f]{7})\.js$/,
        match, md5 = '';
    if(match = uri.match(rMD5)){
        md5 = match[1]; 
    }

    return md5;
}

function _getCacheKey(modName){
    return ( CACHE_KEY_PREFIX 
        ? CACHE_KEY_PREFIX + '_' : '' ) + modName;
}

function _getCache(modName){
    var mod = include._mods[modName],
        key = _getCacheKey(modName),
        md5, cache, pkg;

    if(!mod || !IS_LOCALSTORAGE_ENABLED){
        console.log('no mod defininition');
        return false;
    }

    md5 = _getMD5(mod.uri);
    cache = localStorage.getItem(key);

    if(cache){
        pkg = JSON.parse(cache);
        if(pkg.md5 == md5){
            return pkg.content;
        }
    }
    return false;
}

function _setCache(modName, content){
    var mod = include._mods[modName],
        key = _getCacheKey(modName),
        md5, pkg;

    if(!mod || !IS_LOCALSTORAGE_ENABLED){
        console.log('no mod defininition');
        return false;
    }

    md5 = _getMD5(mod.uri);
    if(content){
        pkg = {
            md5: md5
            , content: content
        };
        localStorage.setItem(
            key
            , JSON.stringify(pkg) 
        );
        return true;
    }

    return false;
}









_initMods();
// console.log(include._mods);

return include;

})();
