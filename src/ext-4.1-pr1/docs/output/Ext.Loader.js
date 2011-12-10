Ext.data.JsonP.Ext_Loader({"mixedInto":[],"xtypes":{},"tagname":"class","html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/Loader.html#Ext-Loader' target='_blank'>Loader.js</a></div></pre><div class='doc-contents'><p>Ext.Loader is the heart of the new dynamic dependency loading capability in Ext JS 4+. It is most commonly used\nvia the <a href=\"#!/api/Ext-method-require\" rel=\"Ext-method-require\" class=\"docClass\">Ext.require</a> shorthand. <a href=\"#!/api/Ext.Loader\" rel=\"Ext.Loader\" class=\"docClass\">Ext.Loader</a> supports both asynchronous and synchronous loading\napproaches, and leverage their advantages for the best development flow. We'll discuss about the pros and cons of each approach:</p>\n\n<h1>Asynchronous Loading</h1>\n\n<ul>\n<li><p>Advantages:</p>\n\n<ul>\n<li>Cross-domain</li>\n<li>No web server needed: you can run the application via the file system protocol (i.e: <code>file://path/to/your/index\n.html</code>)</li>\n<li>Best possible debugging experience: error messages come with the exact file name and line number</li>\n</ul>\n</li>\n<li><p>Disadvantages:</p>\n\n<ul>\n<li>Dependencies need to be specified before-hand</li>\n</ul>\n</li>\n</ul>\n\n\n<h3>Method 1: Explicitly include what you need:</h3>\n\n<pre><code>// Syntax\nExt.require({String/Array} expressions);\n\n// Example: Single alias\nExt.require('widget.window');\n\n// Example: Single class name\nExt.require('Ext.window.Window');\n\n// Example: Multiple aliases / class names mix\nExt.require(['widget.window', 'layout.border', 'Ext.data.Connection']);\n\n// Wildcards\nExt.require(['widget.*', 'layout.*', 'Ext.data.*']);\n</code></pre>\n\n<h3>Method 2: Explicitly exclude what you don't need:</h3>\n\n<pre><code>// Syntax: Note that it must be in this chaining format.\nExt.exclude({String/Array} expressions)\n   .require({String/Array} expressions);\n\n// Include everything except Ext.data.*\nExt.exclude('Ext.data.*').require('*');\n\n// Include all widgets except widget.checkbox*,\n// which will match widget.checkbox, widget.checkboxfield, widget.checkboxgroup, etc.\nExt.exclude('widget.checkbox*').require('widget.*');\n</code></pre>\n\n<h1>Synchronous Loading on Demand</h1>\n\n<ul>\n<li><p>Advantages:</p>\n\n<ul>\n<li>There's no need to specify dependencies before-hand, which is always the convenience of including ext-all.js\nbefore</li>\n</ul>\n</li>\n<li><p>Disadvantages:</p>\n\n<ul>\n<li>Not as good debugging experience since file name won't be shown (except in Firebug at the moment)</li>\n<li>Must be from the same domain due to XHR restriction</li>\n<li>Need a web server, same reason as above</li>\n</ul>\n</li>\n</ul>\n\n\n<p>There's one simple rule to follow: Instantiate everything with Ext.create instead of the <code>new</code> keyword</p>\n\n<pre><code>Ext.create('widget.window', { ... }); // Instead of new Ext.window.Window({...});\n\nExt.create('Ext.window.Window', {}); // Same as above, using full class name instead of alias\n\nExt.widget('window', {}); // Same as above, all you need is the traditional `xtype`\n</code></pre>\n\n<p>Behind the scene, <a href=\"#!/api/Ext.ClassManager\" rel=\"Ext.ClassManager\" class=\"docClass\">Ext.ClassManager</a> will automatically check whether the given class name / alias has already\n existed on the page. If it's not, <a href=\"#!/api/Ext.Loader\" rel=\"Ext.Loader\" class=\"docClass\">Ext.Loader</a> will immediately switch itself to synchronous mode and automatic load the given\n class and all its dependencies.</p>\n\n<h1>Hybrid Loading - The Best of Both Worlds</h1>\n\n<p>It has all the advantages combined from asynchronous and synchronous loading. The development flow is simple:</p>\n\n<h3>Step 1: Start writing your application using synchronous approach.</h3>\n\n<p>Ext.Loader will automatically fetch all dependencies on demand as they're needed during run-time. For example:</p>\n\n<pre><code>Ext.onReady(function(){\n    var window = Ext.createWidget('window', {\n        width: 500,\n        height: 300,\n        layout: {\n            type: 'border',\n            padding: 5\n        },\n        title: 'Hello Dialog',\n        items: [{\n            title: 'Navigation',\n            collapsible: true,\n            region: 'west',\n            width: 200,\n            html: 'Hello',\n            split: true\n        }, {\n            title: 'TabPanel',\n            region: 'center'\n        }]\n    });\n\n    window.show();\n})\n</code></pre>\n\n<h3>Step 2: Along the way, when you need better debugging ability, watch the console for warnings like these:</h3>\n\n<pre><code>[Ext.Loader] Synchronously loading 'Ext.window.Window'; consider adding Ext.require('Ext.window.Window') before your application's code\nClassManager.js:432\n[Ext.Loader] Synchronously loading 'Ext.layout.container.Border'; consider adding Ext.require('Ext.layout.container.Border') before your application's code\n</code></pre>\n\n<p>Simply copy and paste the suggested code above <code>Ext.onReady</code>, i.e:</p>\n\n<pre><code>Ext.require('Ext.window.Window');\nExt.require('Ext.layout.container.Border');\n\nExt.onReady(...);\n</code></pre>\n\n<p>Everything should now load via asynchronous mode.</p>\n\n<h1>Deployment</h1>\n\n<p>It's important to note that dynamic loading should only be used during development on your local machines.\nDuring production, all dependencies should be combined into one single JavaScript file. <a href=\"#!/api/Ext.Loader\" rel=\"Ext.Loader\" class=\"docClass\">Ext.Loader</a> makes\nthe whole process of transitioning from / to between development / maintenance and production as easy as\npossible. Internally <a href=\"#!/api/Ext.Loader-property-history\" rel=\"Ext.Loader-property-history\" class=\"docClass\">Ext.Loader.history</a> maintains the list of all dependencies your application\nneeds in the exact loading sequence. It's as simple as concatenating all files in this array into one,\nthen include it on top of your application.</p>\n\n<p>This process will be automated with Sencha Command, to be released and documented towards Ext JS 4 Final.</p>\n</div><div class='members'><div id='m-cfg'><div class='definedBy'>Defined By</div><h3 class='members-title'>Config options</h3><div class='subsection'><div id='cfg-disableCaching' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-cfg-disableCaching' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-cfg-disableCaching' class='name expandable'>disableCaching</a><span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span></div><div class='description'><div class='short'>Appends current timestamp to script files to prevent caching. ...</div><div class='long'><p>Appends current timestamp to script files to prevent caching.</p>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='cfg-disableCachingParam' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-cfg-disableCachingParam' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-cfg-disableCachingParam' class='name expandable'>disableCachingParam</a><span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span></div><div class='description'><div class='short'>The get parameter name for the cache buster's timestamp. ...</div><div class='long'><p>The get parameter name for the cache buster's timestamp.</p>\n<p>Defaults to: <code>&quot;_dc&quot;</code></p></div></div></div><div id='cfg-enabled' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-cfg-enabled' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-cfg-enabled' class='name expandable'>enabled</a><span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span></div><div class='description'><div class='short'>Whether or not to enable the dynamic dependency loading feature. ...</div><div class='long'><p>Whether or not to enable the dynamic dependency loading feature.</p>\n<p>Defaults to: <code>false</code></p></div></div></div><div id='cfg-paths' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-cfg-paths' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-cfg-paths' class='name expandable'>paths</a><span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span></div><div class='description'><div class='short'>The mapping from namespaces to file paths\n\n{\n    'Ext': '.', // This is set by default, Ext.layout.container.Containe...</div><div class='long'><p>The mapping from namespaces to file paths</p>\n\n<pre><code>{\n    'Ext': '.', // This is set by default, <a href=\"#!/api/Ext.layout.container.Container\" rel=\"Ext.layout.container.Container\" class=\"docClass\">Ext.layout.container.Container</a> will be\n                // loaded from ./layout/Container.js\n\n    'My': './src/my_own_folder' // My.layout.Container will be loaded from\n                                // ./src/my_own_folder/layout/Container.js\n}\n</code></pre>\n\n<p>Note that all relative paths are relative to the current HTML document.\nIf not being specified, for example, <code>Other.awesome.Class</code>\nwill simply be loaded from <code>./Other/awesome/Class.js</code></p>\n<p>Defaults to: <code>{&quot;Ext&quot;: &quot;.&quot;}</code></p></div></div></div></div></div><div id='m-property'><div class='definedBy'>Defined By</div><h3 class='members-title'>Properties</h3><div class='subsection'><div id='property-history' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-property-history' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-property-history' class='name expandable'>history</a><span> : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a></span></div><div class='description'><div class='short'>An array of class names to keep track of the dependency loading order. ...</div><div class='long'><p>An array of class names to keep track of the dependency loading order.\nThis is not guaranteed to be the same everytime due to the asynchronous\nnature of the Loader.</p>\n</div></div></div></div></div><div id='m-method'><div class='definedBy'>Defined By</div><h3 class='members-title'>Methods</h3><div class='subsection'><div id='method-exclude' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-method-exclude' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-method-exclude' class='name expandable'>exclude</a>( <span class='pre'><a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a> excludes</span> ) : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></div><div class='description'><div class='short'>Explicitly exclude files from being loaded. ...</div><div class='long'><p>Explicitly exclude files from being loaded. Useful when used in conjunction with a broad include expression.\nCan be chained with more <code>require</code> and <code>exclude</code> methods, eg:</p>\n\n<pre><code>Ext.exclude('Ext.data.*').require('*');\n\nExt.exclude('widget.button*').require('widget.*');\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>excludes</span> : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span><div class='sub-desc'><p>object contains <code>require</code> method for chaining</p>\n</div></li></ul></div></div></div><div id='method-getConfig' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-method-getConfig' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-method-getConfig' class='name expandable'>getConfig</a>( <span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a> name</span> ) : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></div><div class='description'><div class='short'>Get the config value corresponding to the specified name. ...</div><div class='long'><p>Get the config value corresponding to the specified name. If no name is given, will return the config object</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>name</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The config property name</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getPath' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-method-getPath' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-method-getPath' class='name expandable'>getPath</a>( <span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a> className</span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></div><div class='description'><div class='short'>Translates a className to a file path by adding the\nthe proper prefix and converting the .'s to /'s. ...</div><div class='long'><p>Translates a className to a file path by adding the\nthe proper prefix and converting the .'s to /'s. For example:</p>\n\n<pre><code>Ext.Loader.setPath('My', '/path/to/My');\n\nalert(Ext.Loader.getPath('My.awesome.Class')); // alerts '/path/to/My/awesome/Class.js'\n</code></pre>\n\n<p>Note that the deeper namespace levels, if explicitly set, are always resolved first. For example:</p>\n\n<pre><code>Ext.Loader.setPath({\n    'My': '/path/to/lib',\n    'My.awesome': '/other/path/for/awesome/stuff',\n    'My.awesome.more': '/more/awesome/path'\n});\n\nalert(Ext.Loader.getPath('My.awesome.Class')); // alerts '/other/path/for/awesome/stuff/Class.js'\n\nalert(Ext.Loader.getPath('My.awesome.more.Class')); // alerts '/more/awesome/path/Class.js'\n\nalert(Ext.Loader.getPath('My.cool.Class')); // alerts '/path/to/lib/cool/Class.js'\n\nalert(Ext.Loader.getPath('Unknown.strange.Stuff')); // alerts 'Unknown/strange/Stuff.js'\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>className</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'><p>path</p>\n</div></li></ul></div></div></div><div id='method-onReady' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-method-onReady' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-method-onReady' class='name expandable'>onReady</a>( <span class='pre'><a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a> fn, <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> scope, <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a> withDomReady</span> )</div><div class='description'><div class='short'>Add a new listener to be executed when all required scripts are fully loaded ...</div><div class='long'><p>Add a new listener to be executed when all required scripts are fully loaded</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>fn</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a><div class='sub-desc'><p>The function callback to be executed</p>\n</div></li><li><span class='pre'>scope</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>The execution scope (<code>this</code>) of the callback function</p>\n</div></li><li><span class='pre'>withDomReady</span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><div class='sub-desc'><p>Whether or not to wait for document dom ready as well</p>\n</div></li></ul></div></div></div><div id='method-require' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-method-require' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-method-require' class='name expandable'>require</a>( <span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a> expressions, [<a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a> fn], [<a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> scope], [<a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a> excludes]</span> )</div><div class='description'><div class='short'>Loads all classes by the given names and all their direct dependencies; optionally executes the given callback functi...</div><div class='long'><p>Loads all classes by the given names and all their direct dependencies; optionally executes the given callback function when\nfinishes, within the optional scope. This method is aliased by <a href=\"#!/api/Ext-method-require\" rel=\"Ext-method-require\" class=\"docClass\">Ext.require</a> for convenience</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>expressions</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a><div class='sub-desc'><p>Can either be a string or an array of string</p>\n</div></li><li><span class='pre'>fn</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a> (optional)<div class='sub-desc'><p>The callback function</p>\n</div></li><li><span class='pre'>scope</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> (optional)<div class='sub-desc'><p>The execution scope (<code>this</code>) of the callback function</p>\n</div></li><li><span class='pre'>excludes</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a> (optional)<div class='sub-desc'><p>Classes to be excluded, useful when being used with expressions</p>\n</div></li></ul></div></div></div><div id='method-setConfig' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-method-setConfig' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-method-setConfig' class='name expandable'>setConfig</a>( <span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> config</span> ) : <a href=\"#!/api/Ext.Loader\" rel=\"Ext.Loader\" class=\"docClass\">Ext.Loader</a></div><div class='description'><div class='short'>Set the configuration for the loader. ...</div><div class='long'><p>Set the configuration for the loader. This should be called right after ext-(debug).js\nis included in the page, and before Ext.onReady. i.e:</p>\n\n<pre><code>&lt;script type=\"text/javascript\" src=\"ext-core-debug.js\"&gt;&lt;/script&gt;\n&lt;script type=\"text/javascript\"&gt;\n    Ext.Loader.setConfig({\n      enabled: true,\n      paths: {\n          'My': 'my_own_path'\n      }\n    });\n&lt;script&gt;\n&lt;script type=\"text/javascript\"&gt;\n    Ext.require(...);\n\n    Ext.onReady(function() {\n      // application code here\n    });\n&lt;/script&gt;\n</code></pre>\n\n<p>Refer to config options of <a href=\"#!/api/Ext.Loader\" rel=\"Ext.Loader\" class=\"docClass\">Ext.Loader</a> for the list of possible properties</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>config</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>The config object to override the default values</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Ext.Loader\" rel=\"Ext.Loader\" class=\"docClass\">Ext.Loader</a></span><div class='sub-desc'><p>this</p>\n</div></li></ul></div></div></div><div id='method-setPath' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-method-setPath' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-method-setPath' class='name expandable'>setPath</a>( <span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> name, <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a> path</span> ) : <a href=\"#!/api/Ext.Loader\" rel=\"Ext.Loader\" class=\"docClass\">Ext.Loader</a></div><div class='description'><div class='short'>Sets the path of a namespace. ...</div><div class='long'><p>Sets the path of a namespace.\nFor Example:</p>\n\n<pre><code>Ext.Loader.setPath('Ext', '.');\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>name</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>See <a href=\"#!/api/Ext.Function-method-flexSetter\" rel=\"Ext.Function-method-flexSetter\" class=\"docClass\">flexSetter</a></p>\n</div></li><li><span class='pre'>path</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>See <a href=\"#!/api/Ext.Function-method-flexSetter\" rel=\"Ext.Function-method-flexSetter\" class=\"docClass\">flexSetter</a></p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Ext.Loader\" rel=\"Ext.Loader\" class=\"docClass\">Ext.Loader</a></span><div class='sub-desc'><p>this</p>\n</div></li></ul></div></div></div><div id='method-syncRequire' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Ext.Loader' rel='Ext.Loader' class='definedIn docClass'>Ext.Loader</a><br/><a href='source/Loader.html#Ext-Loader-method-syncRequire' target='_blank' class='viewSource'>view source</a></div><a href='#!/api/Ext.Loader-method-syncRequire' class='name expandable'>syncRequire</a>( <span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a> expressions, [<a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a> fn], [<a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> scope], [<a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a> excludes]</span> )</div><div class='description'><div class='short'>Synchronously loads all classes by the given names and all their direct dependencies; optionally executes the given c...</div><div class='long'><p>Synchronously loads all classes by the given names and all their direct dependencies; optionally executes the given callback function when finishes, within the optional scope. This method is aliased by <a href=\"#!/api/Ext-method-syncRequire\" rel=\"Ext-method-syncRequire\" class=\"docClass\">Ext.syncRequire</a> for convenience</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>expressions</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a><div class='sub-desc'><p>Can either be a string or an array of string</p>\n</div></li><li><span class='pre'>fn</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a> (optional)<div class='sub-desc'><p>The callback function</p>\n</div></li><li><span class='pre'>scope</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> (optional)<div class='sub-desc'><p>The execution scope (<code>this</code>) of the callback function</p>\n</div></li><li><span class='pre'>excludes</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>/<a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a> (optional)<div class='sub-desc'><p>Classes to be excluded, useful when being used with expressions</p>\n</div></li></ul></div></div></div></div></div></div></div>","allMixins":[],"meta":{"author":["Jacky Nguyen <jacky@sencha.com>"],"docauthor":["Jacky Nguyen <jacky@sencha.com>"]},"requires":[],"deprecated":null,"extends":null,"inheritable":false,"static":false,"superclasses":[],"protected":false,"singleton":true,"code_type":"nop","alias":null,"members":{"property":[{"owner":"Ext.Loader","tagname":"property","deprecated":null,"static":false,"protected":false,"template":null,"required":null,"name":"history","id":"property-history"}],"css_var":[],"css_mixin":[],"method":[{"owner":"Ext.Loader","tagname":"method","deprecated":null,"static":false,"protected":false,"template":false,"required":null,"name":"exclude","id":"method-exclude"},{"owner":"Ext.Loader","tagname":"method","deprecated":null,"static":false,"protected":false,"template":false,"required":null,"name":"getConfig","id":"method-getConfig"},{"owner":"Ext.Loader","tagname":"method","deprecated":null,"static":false,"protected":false,"template":false,"required":null,"name":"getPath","id":"method-getPath"},{"owner":"Ext.Loader","tagname":"method","deprecated":null,"static":false,"protected":false,"template":false,"required":null,"name":"onReady","id":"method-onReady"},{"owner":"Ext.Loader","tagname":"method","deprecated":null,"static":false,"protected":false,"template":false,"required":null,"name":"require","id":"method-require"},{"owner":"Ext.Loader","tagname":"method","deprecated":null,"static":false,"protected":false,"template":false,"required":null,"name":"setConfig","id":"method-setConfig"},{"owner":"Ext.Loader","tagname":"method","deprecated":null,"static":false,"protected":false,"template":false,"required":null,"name":"setPath","id":"method-setPath"},{"owner":"Ext.Loader","tagname":"method","deprecated":null,"static":false,"protected":false,"template":false,"required":null,"name":"syncRequire","id":"method-syncRequire"}],"cfg":[{"owner":"Ext.Loader","tagname":"cfg","deprecated":null,"static":false,"protected":false,"template":null,"required":false,"name":"disableCaching","id":"cfg-disableCaching"},{"owner":"Ext.Loader","tagname":"cfg","deprecated":null,"static":false,"protected":false,"template":null,"required":false,"name":"disableCachingParam","id":"cfg-disableCachingParam"},{"owner":"Ext.Loader","tagname":"cfg","deprecated":null,"static":false,"protected":false,"template":null,"required":false,"name":"enabled","id":"cfg-enabled"},{"owner":"Ext.Loader","tagname":"cfg","deprecated":null,"static":false,"protected":false,"template":null,"required":false,"name":"paths","id":"cfg-paths"}],"event":[]},"statics":{"property":[],"css_var":[],"method":[],"css_mixin":[],"cfg":[],"event":[]},"subclasses":[],"uses":[],"private":false,"name":"Ext.Loader","mixins":[],"id":"class-Ext.Loader","component":false,"alternateClassNames":[],"files":[{"href":"Loader.html#Ext-Loader","filename":"Loader.js"}]});