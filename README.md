## iApp OPOA框架


单页面应用框架，将你的Webapp分成数个View Page，就像Native App一样。框架使用简单，主要包括以下特性：

* Page的完整生命周期管理，异步加载Html，静态资源；
* 仿 **ZAKER** 垂直方向Page转场特效，并实现顶部拖拽触发；（后续加入左右方式转场，并增加动画特效）
* 压栈式History机制，通过简单的前进、后退来管理（后续会加入Router功能）；

### API

##### html Layout

首先webapp需要一段约定的html、css，来布局：

```
 <div id="app" class="app">
   <div class="app-view" id="main-view">
     <div class="app-view-content"> </div>
   </div>
 </div>
```
.app 是App dom容器

.app-view 是View page 容器；

.app-view-content 是View正文内容html容器；


##### App初始化

```
 new iApp('#app', {
	backBtnCls : 'app-button-back',
	footBar : '<div class="button app-button-back">返回</div>'
 });
```
* el selector : iApp对象的根节点容器；

* options.navBar : App 顶部导航html；

* options.footBar : App 底部通栏html；
* 
* options.backBtnCls : App 中带后退功能按钮的指定Class


##### api methods:

  *  addView(options)  添加一个View page对象
  
    * options.id : view id, 整个App中的唯一标示符，并用来当做DOM id，请注意；
    
    * options.cache : view dom节点是否缓存，默认为false，在退出当前view时删除dom；
    
    * options.html : dom结构，每次初始化时动态插入；
    
    * options.url : 远程html，异步加载插入app（和html配置二选其一）；
    
    * options.navBar : 个性化导航条html;
    
    * options.footBar : 个性化底部通栏html;
    
    * options.oninit : view对象初始化时，触发的回调，转场动画之前执行；
    
    * options.onload : view对象显示时，触发的回调，转场动画开始时执行；
    
    * options.onhide : view对象隐藏、退出时，触发的回调，转场动画开始时执行；
    
    
  * initView(id)  初始化加载view对象，该view无转场动画出现，默认当做iApp首页
  
  
  * forward(id)  跳转到指定view，根据 id 加载view对象，history压栈列表中会增加一个记录，执行前进转场动画；
  
  
  * back()  回退，根据history压栈列表，自动返回上一层view，相当于native返回功能，执行回退转场动画
    
##### view lifecycle

view生命周期经历三个过程：init、load、hide（后续加入 destroy事件）；

**demo**：

```
	App.addView({
		id : 'hot-view',
		cache : false,
		html : '<ul class="rank-tab-list" id="rank-list"></ul>',
		navBar : '<ul class="category-list"> </ul>\
				  <ul class="rank-tab">\
					<li class="current first">总榜单</li>\
					<li class="category-tab">分类</li>\
				  </ul>',
		oninit : function(){
			$('#start-loading').addClass('loading');
			require.async("./rank", function (module){
				module.hot();
			});
		},
		onhide : function(){
			LaiWang.event.trigger('resume');
		}
	});
```

oninit 初始化逻辑中，可以异步载入view模块代码。所以整个app view 的构建不会影响你原有编码风格。你可以非常快速的将现有页面插入iApp。只要加入前进、后退转场api即可。

iApp 仅依赖 $ 框架、js module Loader。耦合性非常低，也方便你快速扩张您的 webapp 功能