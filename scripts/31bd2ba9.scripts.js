"use strict";angular.module("interfaceApp",["ngCookies","ngSanitize","ngRoute","ngAnimate","mgcrea.ngStrap.collapse","mgcrea.ngStrap.dropdown","MessageCenterModule","ngCsv"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/site/:code/:explore",{templateUrl:"views/site.html",controller:"SiteCtrl"}).when("/entity/:code/:entityId",{templateUrl:"views/entity.html",controller:"EntityCtrl"}).when("/play",{templateUrl:"views/play.html",controler:"PlayCtrl"}).when("/login/:code",{template:"<div></div>",controller:["AuthService",function(a){a.getToken()}]}).when("/forbidden",{template:"<h4 class='text-center'>You don't have permission to use this site.</h4>"}).otherwise({redirectTo:"/"})}]).factory("authInterceptor",["$rootScope","$q","$window",function(a,b,c){return{request:function(a){return a.headers=a.headers||{},c.localStorage.token&&(a.headers.Authorization="Bearer "+c.localStorage.token),a},response:function(a){return 401===a.status,a||b.when(a)}}}]).config(["$httpProvider",function(a){a.interceptors.push("authInterceptor")}]),angular.module("interfaceApp").controller("MainCtrl",["$scope","$http","AuthService","configuration",function(a,b,c,d){a.ready=!1,a.loggedIn=!1;var e=function(){var c=d[d.service];b.get(c).then(function(b){a.sites=b.data.sites,console.log(a.sites),a.serviceUnavailable=!1,a.ready=!0},function(){a.serviceUnavailable=!0,a.ready=!1})};e(),a.$on("user-logged-in",function(){var b=c.getUserData();a.name=b.name,a.loggedIn=!0,e()}),a.$on("user-logged-out",function(){a.loggedIn=!1,a.name=void 0,a.sites=void 0,e()}),c.verify(!1),a.login=function(){c.login()},a.logout=function(){c.logout()}}]),angular.module("interfaceApp").constant("configuration",{development:"https://service.esrc.info",production:"https://cnex.esrc.unimelb.edu.au",service:"production",solr:"https://solr.esrc.unimelb.edu.au/ESRC/select",searchFields:{0:{fieldName:"name",displayName:"Name",weight:"1"},1:{fieldName:"altname",displayName:"Alternate Name",weight:"1"},2:{fieldName:"binomial_name",displayName:"Binomial Name",weight:"1"},3:{fieldName:"text",displayName:"Content",weight:"1"}},searchWhat:["0","1","2","3"],defaultColors:{person:"#FF6961",corporatebody:"#779ECB",event:"#03C03C",concept:"#FF9900",place:"#966FD6",culturalartefact:"#FFB347",published:"#77DD77",archival:"#779ECB",digitalobject:"#C23B22"},types:{},mapForward:{person:"Person",corporatebody:"Corporate Body",event:"Event",concept:"Concept",place:"Place",culturalartefact:"Cultural Artefact",published:"Published Resource",archival:"Archival Resource",digitalobject:"Digital Object"},mapReverse:function(){var a={};return angular.forEach(this.mapForward,function(b,c){a[b]=c}),a},pallette:["#C23B22","#FF6961","#03C03C","#77DD77","#779ECB","#AEC6CF","#FFDF00","#966FD6","#B19CD9","#FF9900","#FFB347"],opacity:{"default":"1",unselected:"0.5"},height:{selected:"15","default":"5"},radius:{date:{"default":"5"}}}),angular.module("interfaceApp").controller("SiteCtrl",["$rootScope","$scope","$routeParams","$http","$timeout","$location","configuration","DataService",function(a,b,c,d,e,f,g,h){b.site=c.code,b.graph=c.explore,b.service=g[g.service],b.showEntityNetwork=!1,b.initting=!0,b.progress=!1,b.datasetError=!1,b.ready=!1,b.loadGraph=!1,b.total=0,b.processed=0;var i=b.service+"/network/"+b.site+"/"+b.graph;d.get(i).then(function(a){e(function(){b.update()},100),b.progress=!1,b.site={name:a.data.name,url:a.data.url,code:b.site},h.site=b.site},function(){b.datasetError=!0,b.progress=!1,b.initting=!1}),b.$on("graph-ready",function(){b.showControls=!0}),b.$on("load-entity-network-view",function(){b.showEntityNetwork=!0}),b.$on("destroy-entity-network-view",function(){b.showEntityNetwork=!1}),b.$on("$locationChangeStart",function(a,c,d){d.match(/^.*\/site\/.*\/byEntity$/)&&b.showEntityNetwork===!0&&(b.showEntityNetwork=!1,a.preventDefault())}),b.update=function(){var a=b.service+"/network/"+b.site.code+"/"+b.graph+"/status";d.get(a).then(function(a){null!==a.data.processed?(b.initting=!1,b.progress=!0,b.processed=a.data.processed,b.total=a.data.total,e(function(){b.update()},100)):(b.progress=!1,b.initting=!1,b.processData(a.data))},function(){b.progress=!1})},b.processData=function(a){b.data=h.processSiteData(a),b.ready=!0,e(function(){b.loadGraph=!0},100)}}]),angular.module("interfaceApp").directive("forceNetworkGraph",["$rootScope","$window","$routeParams","$timeout","configuration","DataService","D3Service",function(a,b,c,d,e,f,g){return{templateUrl:"views/force-network-graph.html",restrict:"E",scope:{data:"="},link:function(a,c){var f=angular.element(b);f.bind("resize",function(){a.$apply(function(){d3.select("#site_graph").select("svg").style("width",c[0].parentElement.clientWidth).style("height",b.innerHeight)})}),a.$on("reset",function(){o.transition().attr("class","link").attr("stroke","#ccc").attr("stroke-width",2).attr("opacity",e.opacity.default),p.transition().attr("class","node").attr("r",function(a){return a.r}).attr("fill",function(a){return a.color}).attr("opacity",e.opacity.default)}),a.nodes=a.data.nodes,a.links=a.data.links;var f=c[0].parentElement.clientWidth,h=b.innerHeight,i=function(){if(a.force.alpha()>.004)d(function(){i()},500);else{var b=g.calculateTransformAndScale("#site_graph");l.translate(b.translate).scale(b.scale),d3.select("#site_graph").selectAll("g").transition().duration(500).attr("transform","translate("+b.translate+") scale("+b.scale+")"),j(),a.relaxed=!0}},j=function(){g.renderLabels("#site_graph")},k=function(){var a=d3.select("#site_graph").selectAll("g");a.attr("transform","translate("+d3.event.translate+") scale("+d3.event.scale+")")},l=d3.behavior.zoom().scaleExtent([0,8]).on("zoom",k);a.tickCounter=0;var m=function(){var b=d3.select("#site_graph").selectAll(".link");b.attr("x1",function(a){return a.source.x}).attr("y1",function(a){return a.source.y}).attr("x2",function(a){return a.target.x}).attr("y2",function(a){return a.target.y});var c=d3.select("#site_graph").selectAll(".node");c.attr("transform",function(a){return"translate("+a.x+","+a.y+")"}),a.tickCounter+=1,2===a.tickCounter&&(a.tickCounter=0,a.$apply(function(){a.total=.1,a.processed=a.force.alpha()}))};a.force=d3.layout.force().nodes(a.nodes).links(a.links).charge(-2e3).linkDistance(100).linkStrength(1).size([f,h]).on("tick",m).start();var n=d3.select("#site_graph").append("svg").attr("width",f).attr("height",h).attr("viewBox","0 0 "+f+" "+h).attr("preserveAspectRatio","xMinYMin meet").call(l).append("g").attr("class","node-container");d3.select("#site_graph").select("svg").append("g").attr("class","text-container");var o=n.selectAll(".link").data(a.force.links()),p=n.selectAll(".node").data(a.force.nodes());o.enter().append("line").attr("id",function(a){return"link_"+g.sanitize(a.source.id)+"_"+g.sanitize(a.target.id)}).attr("class","link").attr("stroke","#ccc").attr("stroke-width",2),o.exit().remove(),p.enter().append("circle").attr("id",function(a){return"node_"+g.sanitize(a.id)}).attr("class","node").attr("r",function(a){return a.rByEntity}).attr("fill",function(a){return a.color}),p.exit().remove(),p.on("click",function(b){a.$apply(function(){g.highlightNodeAndLocalEnvironment(b.id,"#site_graph")})}),i()}}}]),angular.module("interfaceApp").directive("progressMeter",function(){return{templateUrl:"views/progress-meter.html",restrict:"E",scope:{processed:"@",total:"@",invert:"@"},link:function(a){a.$watch("processed",function(){b()});var b=function(){var b=a.processed/a.total*100;a.width=angular.fromJson(a.invert)===!0?100-b||1:b}}}}),angular.module("interfaceApp").controller("PlayCtrl",["$scope","$window",function(){}]),angular.module("interfaceApp").directive("siteControls",["$rootScope","$window","$http","$sce","$timeout","DataService","configuration","D3Service","SolrService",function(a,b,c,d,e,f,g,h,i){return{templateUrl:"views/site-controls.html",restrict:"E",scope:{data:"=",site:"="},link:function(j){j.construct=function(a){var b=[];"selected"===a?(angular.forEach(f.selected,function(a){b.push([a.id,a.type,a.name,a.url])}),j.selectedNodesData=b):"unconnected"===a&&(angular.forEach(j.data.unConnectedNodes,function(a){angular.forEach(a,function(a){b.push([a.id,a.type,a.name,a.url])})}),j.unConnectedNodesData=b)},j.labelsVisible=!0,j.currentRotation=0,j.disableDownloadButton=!1,j.unconnectedDownload=!1,j.data.unConnectedTotal=0,_.isEmpty(j.data.unConnectedNodes)||(angular.forEach(j.data.unConnectedNodes,function(a){j.data.unConnectedTotal+=a.length}),j.construct("unconnected"),j.unconnectedDownload=!0);var k=angular.element(b);k.bind("resize",function(){j.$apply(function(){l()})});var l=function(){angular.element(document.getElementById("dateVisContainer"));j.controlsPanelStyle={height:b.innerHeight-15,"overflow-y":"auto"}};l(),j.showData=!1,j.$on("node-data-ready",function(){var a;j.contextNodeData=f.contextNode,void 0!==f.contextNode?(j.clearTypes(),j.contextNodeData=j.data.datamap[f.contextNode],a=_.reject(f.selected,function(a){return a.id===f.contextNode})):a=f.selected,a=_.groupBy(a,function(a){return a.type}),j.contextNetworkData={},angular.forEach(a,function(a,b){j.contextNetworkData[b]=_.sortBy(a,function(a){return a.name})}),void 0!==f.selected?(j.construct("selected"),j.selectionsDownload=!0):(j.selectedNodesData=void 0,j.selectionsDownload=!1)}),j.$on("search-data-ready",function(){angular.forEach(j.data.types,function(a,b){j.data.types[b].checked=!1}),h.highlightById("#site_graph",i.selected)}),j.$on("colours-changed",function(){{var a=d3.select("#site_graph").selectAll(".node").data();f.processNodeSet(a)}d3.select("#site_graph").transition().duration(500).selectAll(".node").attr("fill",function(a){return f.getColor(a.type)}).style("stroke",function(a){return f.getColor(a.type)}),d3.selectAll(".date").transition().duration(500).attr("fill",function(a){return f.getColor(a.type)}).style("stroke",function(a){return f.getColor(a.type)}),angular.forEach(j.data.types,function(a,b){j.data.types[b].color=g.types[b].color})}),j.clearTypes=function(){angular.forEach(j.data.types,function(a,b){j.data.types[b].checked=!1})},j.highlightByType=function(a){j.data.types[a].checked=!j.data.types[a].checked,h.highlightByType("#site_graph",a)},j.reset=function(){j.clearTypes(),j.contextNodeData=void 0,j.contextNetworkData=void 0,f.selected=void 0,f.contextNode=void 0,j.showData=!1,h.sizeBy="r",h.reset("#site_graph"),j.sizeBy=["","active","",""],a.$broadcast("reset-search")},j.viewEntityNetwork=function(a){f.getEntityNetwork(a)},j.toggleLabels=function(){j.labelsVisible===!0?(d3.select("#site_graph").selectAll("text").attr("class","hidden"),j.labelsVisible=!1):(d3.select("#site_graph").selectAll("text").classed({hidden:!1}),j.labelsVisible=!0)},j.sizeNodesBy=function(a){"evenly"===a?j.sizeBy=["active","","",""]:"entities"===a?j.sizeBy=["","active","",""]:"publications"===a?j.sizeBy=["","","active",""]:"objects"===a&&(j.sizeBy=["","","","active"]),h.sizeNodesBy("#site_graph",a),h.renderLabels("#site_graph")},j.downloadGraph=function(){j.disableDownloadButton=!0;var a=g[g.service]+"/convert/"+f.site.code;c.post(a,{graph:f.siteGraph}).then(function(a){j.graphUrl=d.trustAsResourceUrl(a.data.file),e(function(){document.getElementById("graphDownloader").click(),j.disableDownloadButton=!1},200)},function(){})},j.panels={activePanel:[0,1,2]},j.sizeBy=["","active","",""]}}}]),angular.module("interfaceApp").service("DataService",["$rootScope","$http","$timeout","configuration",function(a,b,c,d){function e(e){a.$broadcast("load-entity-network-view"),o.currentEntity=e;var g=d[d.service],h=g+"/entity/"+o.site.code+"/"+e;b.get(h).then(function(){c(function(){i()},100)},function(){});var i=function(){var a=g+"/entity/"+o.site.code+"/"+e+"/status";b.get(a).then(function(a){"complete"===a.data.status?f(a.data.graph):c(function(){i()},100)},function(){})}}function f(b){o.entityGraph=b.graph;var c=o.processNodeSet(b.nodes);o.entityData={nodes:c.linkedNodes,links:b.links,types:j(c.linkedNodes),datamap:c.map},a.$broadcast("draw-entity-graph")}function g(a){o.siteGraph=a.graph;var b=a.graph.nodes,c=a.graph.links;b=o.processNodeSet(b);var d=b.map,e=b.linkedNodes,f=b.unLinkedNodes,g={nodes:e,links:h(c,_.pluck(e,"id")),unConnectedNodes:i(f),types:j(e),datamap:d};return g}function h(a,b){var c=[];return angular.forEach(a,function(a){var d=a.sid,e=a.tid;if(-1!==b.indexOf(d)&&-1!==b.indexOf(e)){var f={source:b.indexOf(d),target:b.indexOf(e),source_id:d,target_id:e};c.push(f)}}),c}function i(a){var b={},c=_.groupBy(a,function(a){return a.type});return angular.forEach(c,function(a,c){b[c]=_.sortBy(a,function(a){return a.name})}),b}function j(a){var b={};return angular.forEach(a,function(a,c){c=void 0!==d.mapForward[a.type.toLowerCase()]?d.mapForward[a.type.toLowerCase()]:a.type,void 0===b[c]?b[c]={count:1,checked:!1,color:a.color,coreType:d.mapForward[a.coreType.toLowerCase()]}:b[c].count+=1}),k(b),b}function k(a){angular.forEach(a,function(a,b){void 0===d.types[b]&&(d.types[b]=a)})}function l(a){return void 0!==d.mapForward[a.toLowerCase()]&&(a=d.mapForward[a.toLowerCase()]),d.types[a].color}function m(a,b){void 0!==d.mapForward[a.toLowerCase()]&&(a=d.mapForward[a.toLowerCase()]),d.types[a].color=b}function n(a){var b=[],c=[],e=[],f=[];angular.forEach(a,function(a){void 0!==a.connections&&b.push(a.connections),void 0!==a.relatedEntities&&c.push(a.relatedEntities),void 0!==a.relatedPublications&&e.push(a.relatedPublications),void 0!==a.relatedDobjects&&f.push(a.relatedDobjects)});var g=[Math.min.apply(null,b),Math.max.apply(null,b)],h=[Math.min.apply(null,c),Math.max.apply(null,c)],i=[Math.min.apply(null,e),Math.max.apply(null,e)],j=[Math.min.apply(null,f),Math.max.apply(null,f)],k=d3.scale.linear().range([10,40]).domain([Math.min.apply(null,g),Math.max.apply(null,g)]),l=d3.scale.linear().range([10,40]).domain([Math.min.apply(null,h),Math.max.apply(null,h)]),m=d3.scale.linear().range([10,40]).domain([Math.min.apply(null,i),Math.max.apply(null,i)]),n=d3.scale.linear().range([10,40]).domain([Math.min.apply(null,j),Math.max.apply(null,j)]),o={},p=[],q=[];return angular.forEach(a,function(a){void 0!==a.name&&(a.color=d.defaultColors[a.coreType.toLowerCase()],a.r=k(a.connections),a.rByEntity=l(a.relatedEntities),a.rByPublication=m(a.relatedPublications),a.rByDobject=n(a.relatedDobjects),o[a.id]=a,0===a.connections?q.push(a):p.push(a))}),{map:o,linkedNodes:p,unLinkedNodes:q}}var o={processingStatus:{},getEntityNetwork:e,processSiteData:g,processNodeSet:n,getColor:l,setColor:m};return o}]),angular.module("interfaceApp").directive("dateVis",["$rootScope","$window","configuration","DataService","D3Service",function(a,b,c,d,e){return{templateUrl:"views/date-vis.html",restrict:"E",scope:{data:"="},link:function(a,d){a.dates=[],a.points=[],a.ranges=[];var f=angular.element(b);f.bind("resize",function(){a.$apply(function(){a.drawDateVis()})}),a.$on("reset",function(){var a=d3.selectAll(".dateRange");a.attr("fill",function(a){return a.color}).attr("opacity",c.opacity.default).attr("height",c.height.default);var b=d3.selectAll(".datePoint");b.attr("fill",function(a){return a.color}).attr("opacity",c.opacity.default).attr("r",c.radius.date.default)}),a.drawDateVis=function(){if(d3.select("#date_vis").select("svg").remove(),a.width=d.parent()[0].clientWidth-30,a.height=.55*a.width,0===a.ranges.length||0===a.points.length||0===a.dates.length){var b=a.data.nodes,f=[],g=[],h=[];angular.forEach(b,function(a){null!==a.df&&null!==a.dt?(h.push(a.df),h.push(a.dt),g.push(a)):null!==a.df?(h.push(a.df),f.push(a)):null!==a.dt&&(h.push(a.dt),f.push(a))}),a.ranges=_.sortBy(g,"df").reverse(),f=_.sortBy(f,"df"),a.points=_.sortBy(f,"dt").reverse(),a.dates=h}var i=Date.parse(d3.min(a.dates)),j=Date.parse(d3.max(a.dates)),k=d3.time.scale().domain([i,j]).range([10,a.width-10]),l=d3.svg.axis().scale(k).ticks(d3.time.years).ticks(6).orient("bottom"),m=d3.select("#date_vis").append("svg").attr("width",a.width).attr("height",a.height).append("g"),n=(m.append("g").attr("class","axis").attr("transform","translate(0,"+(a.height-30)+")").call(l),d3.scale.linear().domain([0,a.ranges.length]).range([10,a.height-40])),o=m.selectAll(".dateRange").data(a.ranges);o.enter().append("rect").attr("class","date").attr("x",function(a){var b=Date.parse(a.df);return k(b)}).attr("y",function(a,b){return n(b)}).attr("width",function(a){var b=Date.parse(a.df),c=Date.parse(a.dt);return k(c)-k(b)}).attr("height",c.height.default).attr("fill",function(a){return a.color}).attr("id",function(a){return e.sanitize(a.id)+"_date"}).on("click",function(b){a.$apply(function(){e.highlightNodeAndLocalEnvironment(b.id,"#site_graph")})}),n.domain([0,a.points.length]);var p=m.selectAll("datePoint").data(a.points);p.enter().append("circle").attr("class","date").attr("cx",function(a){if(null!==a.df)var b=Date.parse(a.df);else var b=Date.parse(a.dt);return k(b)}).attr("cy",function(a,b){return n(b)}).attr("r",c.radius.date.default).attr("fill",function(a){return a.color}).attr("id",function(a){return e.sanitize(a.id)+"_date"}).on("click",function(b){a.$apply(function(){e.highlightNodeAndLocalEnvironment(b.id,"#site_graph")})})},a.drawDateVis()}}}]),angular.module("interfaceApp").service("D3Service",["$rootScope","configuration","DataService",function(a,b,c){function d(b,d){var e=[];return v.type=[],v.contextNode===b?(v.contextNode=void 0,void v.reset(d)):(d3.select(d).selectAll(".text_landmark").remove(),v.contextNode=b,e.push(b),d3.select(d).selectAll(".link").each(function(a){a.source.id===b?e.push(a.target.id):a.target.id===b&&e.push(a.source.id)}),v.highlight(b,e),v.highlightLinks(b,e),v.labelSelections(d,e),c.contextNode=e[0],c.selected=q(d,e),a.$broadcast("node-data-ready"),void a.$broadcast("reset-search"))}function e(d,e){if(-1!==v.type.indexOf(e)){if(v.type.splice(v.type.indexOf(e),1),0===v.type.length)return void v.reset(d)}else v.type.push(e);var f=[];d3.selectAll(".node").each(function(a){-1!==v.type.indexOf(a.type)&&f.push(a.id)}),d3.selectAll(".link").style("stroke","#ccc").attr("opacity",b.opacity.unselected),v.highlight(void 0,f),v.labelSelections(d,f),c.contextNode=void 0,c.selected=q(d,f),a.$broadcast("node-data-ready"),a.$broadcast("reset-search")}function f(b,d){v.reset(b),v.highlight(void 0,d),v.labelSelections(b,d),c.contextNode=void 0,c.selected=q(b,d),a.$broadcast("node-data-ready")}function g(a,d){d3.selectAll(".node").transition().duration(500).attr("fill",function(a){return-1!==d.indexOf(a.id)?c.getColor(a.type):"#ccc"}).style("stroke",function(b){return b.id===a?"black":-1!==d.indexOf(b.id)?c.getColor(b.type):"#ccc"}).attr("opacity",function(a){return-1!==d.indexOf(a.id)?b.opacity.default:b.opacity.unselected}),d3.selectAll(".date").transition().duration(500).attr("opacity",function(a){return-1===d.indexOf(a.id)?0:void 0}).style("stroke",function(b){return b.id===a?"black":-1!==d.indexOf(b.id)?c.getColor(b.type):"#ccc"})}function h(a,c){d3.selectAll(".link").transition().duration(500).style("stroke",function(b){return-1!==c.indexOf(b.source.id)&&b.target.id===a?"black":-1!==c.indexOf(b.target.id)&&b.source.id===a?"black":"#ccc"}).attr("opacity",function(d){return-1!==c.indexOf(d.source.id)&&d.target.id===a?b.opacity.default:-1!==c.indexOf(d.target.id)&&d.source.id===a?b.opacity.default:b.opacity.unselected})}function i(d){d3.select(d).selectAll(".node").transition().duration(500).attr("r",function(a){return a[v.sizeBy]}).attr("fill",function(a){return c.getColor(a.type)}).style("stroke",function(a){return c.getColor(a.type)}).attr("opacity",function(){return b.opacity.default}),d3.select(d).selectAll(".link").transition().duration(500).style("stroke","#ccc").attr("opacity",b.opacity.default),d3.selectAll(".date").transition().duration(500).attr("opacity",b.opacity.default).style("stroke",function(a){return c.getColor(a.type)}),v.type=[],c.contextNode=void 0,c.selected=void 0,v.renderLabels(d),a.$broadcast("node-data-ready")}function j(a,b){d3.select(a).selectAll(".node").transition().duration([750]).attr("r",function(a){return"evenly"===b?(v.sizeBy="r","10"):"entities"===b?(v.sizeBy="rByEntity",a.rByEntity):"publications"===b?(v.sizeBy="rByPublication",a.rByPublication):"objects"===b?(v.sizeBy="rByDobject",a.rByDobject):void 0})}function k(a){var b=a.replace(/\(|\)/g,"").replace(/ /g,"_");return b}function l(a){var b={};return b.translate=a.match(/translate\(.*?\)/)[0],b.scale=a.match(/scale\(.*?\)/)[0],b.rotate=a.match(/rotate\(.*?\)/)[0],b}function m(a,b){d3.select(a).selectAll("text").remove();var c,d=d3.select(a).select(".node-container"),e=v.parseTransform(d.attr("transform"));return c=-345===b?0:b-15,d.transition().duration(500).attr("transform","rotate("+c+")"+e.translate+" "+e.scale),c}function n(a,b){d3.select(a).selectAll("text").remove();var c,d=d3.select(a).select(".node-container"),e=v.parseTransform(d.attr("transform"));return c=345===b?0:b+15,d3.select(a).select("svg")[0][0].getBBox(),d.transition().duration(500).attr("transform","rotate("+c+")"+e.translate+" "+e.scale),c}function o(a){var b=d3.select(a).select(".node-container")[0][0].getBoundingClientRect(),c=d3.select(a)[0][0].getBoundingClientRect(),d=b.width>b.height?b.width:b.height,e=c.width/d,f=(b.width-c.width)/2*e,g=(b.height-c.height)/2*e,h=[f,g];return{translate:h,scale:.8*e}}function p(a,b){var c,d,e=d3.select(a).select("svg").attr("width"),f=d3.select(a).select("svg").attr("height"),g=b.x/e,h=b.y/f;return.5>g&&.5>h?(c=b.x+b.r/2,d=b.y-b.r/2):.5>g&&h>.5?(c=b.x+b.r/2,d=b.y+b.r/2):g>.5&&.5>h?(c=b.x+b.r/2,d=b.y-b.r/2):(c=b.x+b.r/2,d=b.y+b.r/2),{x:c,y:d}}function q(a,b){var c=[];return angular.forEach(b,function(b){d3.select(a).select("#node_"+b).each(function(a){c.push(a)})}),c}function r(a){void 0!==v.selected?v.labelSelections(a,v.selected):v.labelMainEntities(a)}function s(a,b){b=q(a,b),b=_.sortBy(b,function(a){return a[v.sizeBy]}),b=b.reverse(),v.label(a,b.slice(0,v.nLabels))}function t(a){var b=_.sortBy(d3.select(a).selectAll(".node").data(),function(a){return a[v.sizeBy]});b=b.reverse(),v.label(a,b.slice(0,v.nLabels))}function u(a,b){d3.select(a).selectAll("text").remove();angular.forEach(b,function(b){d3.select(a).select("#node_"+b.id).each(function(b){var c=p(a,b);d3.select(a).select(".text-container").append("text").attr("x",c.x).attr("y",c.y).attr("id","text_"+b.id).attr("class","text-landmark").attr("font-size","20px").text(b.name)})})}var v={highlightedTypes:[],nLabels:5,sizeBy:"r",colors:d3.scale.category20(),highlightNodeAndLocalEnvironment:d,highlightByType:e,highlightById:f,highlight:g,highlightLinks:h,sizeNodesBy:j,parseTransform:l,rotateLeft:m,rotateRight:n,calculateTransformAndScale:o,renderLabels:r,labelMainEntities:t,labelSelections:s,label:u,determineLabelPosition:p,reset:i,sanitize:k};return v.fill={},v.opacity={},v.stroke={},v.strokeWidth={},v.height={},v.contextNode=void 0,v.type=[],v}]),angular.module("interfaceApp").service("AuthService",["$location","$routeParams","$http","$rootScope","$timeout","messageCenterService",function a(b,c,d,e,f,g){function h(){o("AuthService.init()"),null===localStorage.getItem("token")?a.login():(o("Found local token. Verifying"),a.verify())}function i(){o("AuthService.login(). Redirecting to login service.");var b=a.service;window.location=b}function j(){o("AuthService.logout(). Removing local token."),localStorage.removeItem("token"),e.$broadcast("user-logged-out")}function k(){if(o("AuthService.getToken()"),void 0===c.code)a.login();else{o("Found code. Retrieving token.");var e=a.service+"/token/"+c.code;d.get(e).then(function(a){o("Saving token. Redirecting to home page."),localStorage.setItem("token",a.data),b.url("/")},function(b){401===b.status&&a.login()})}}function l(b){o("AuthService.verify()");var c=a.service+"/token";d.get(c).then(function(b){a.claims=b.data.claims,e.$broadcast("user-logged-in")},function(c){401===c.status&&(e.$broadcast("user-logged-out"),b!==!1&&(g.removeShown(),g.add("danger","You are not authorized to use this application. Redirecting you to the login service in 3s.",{status:g.status.shown},{timeout:3e3}),f(function(){g.removeShown(),a.login()},3e3)))})}function m(){var c;return angular.forEach(a.claims.apps,function(a,d){-1!==b.absUrl().search(d)&&(c=a)}),void 0===c?(console.log("Something's not right. Not logging you in."),a.logout(),void g.add("danger","Oh snap! We're having some issues right now. Hopefully these will be resolved soon.")):void 0!==a.claims?{name:a.claims.user.name,email:a.claims.user.email,admin:c.admin}:void 0}var n=!1,o=function(a){n&&console.log(a)},a={service:"https://sos.esrc.unimelb.edu.au",token:void 0,claims:void 0,verified:!1,init:h,login:i,logout:j,getToken:k,verify:l,getUserData:m};return a}]),angular.module("interfaceApp").service("SolrService",["$http","$rootScope","$routeParams","configuration","DataService",function b(a,c,d,e){var f=e.solr,g=function(g){if(void 0!==g){var h=[],i=[];angular.forEach(e.searchWhat,function(a){i.push({name:e.searchFields[a].fieldName,weight:e.searchFields[a].weight})}),"keyword"===b.searchType?(g=g.replace(/ /gi," "+b.keywordUnion+" "),angular.forEach(i,function(a){h.push(a.name+":("+g+")")})):angular.forEach(i,function(a){h.push(a.name+':"'+g+'"')}),h=h.join(" OR "),h={url:f,params:{q:h,start:0,rows:0,wt:"json",fq:"site_code:"+d.code,"json.wrf":"JSON_CALLBACK",spellcheck:"off"}},a.jsonp(f,h).then(function(d){h.params.rows=d.data.response.numFound,h.params.fl="record_id",a.jsonp(f,h).then(function(a){var d=[];angular.forEach(a.data.response.docs,function(a){void 0!==a.record_id&&d.push(a.record_id)}),b.selected=d,c.$broadcast("search-data-ready")},function(){})},function(){})}},b={search:g};return b}]),angular.module("interfaceApp").directive("searchForm",["$routeParams","$location","SolrService",function(a,b,c){return{templateUrl:"views/search-form.html",restrict:"E",scope:{searchType:"@"},link:function(a){a.$on("reset-search",function(){a.nSearchMatches=void 0,a.searchBox=void 0}),a.$on("search-data-ready",function(){a.nSearchMatches=c.selected.length}),a.search=function(){""===a.searchBox&&(a.searchBox="*"),c.search(a.searchBox,0,!0)},a.setSearchType=function(b){c.searchType=b,"phrase"===c.searchType?(a.keywordSearch=!1,a.phraseSearch=!0):(a.phraseSearch=!1,a.keywordSearch=!0),a.search()},a.setSearchType(a.searchType)}}}]),angular.module("interfaceApp").directive("slider",["configuration",function(a){return{template:"",restrict:"A",scope:{fadeBackground:"&"},link:function(b,c){b.$on("reset",function(){c[0].value=a.opacity.unselected}),c.bind("change",function(){b.fadeBackground()}),c[0].value=a.opacity.unselected}}}]),angular.module("interfaceApp").directive("entityNetwork",["$window","$http","$location","$rootScope","$timeout","$routeParams","DataService","D3Service","configuration",function(a,b,c,d,e,f,g,h,i){return{templateUrl:"views/entity-network.html",restrict:"E",scope:{sizeToParent:"@"},link:function(j,k){j.highlight=!1,j.removeClose=!1,j.$on("draw-entity-graph",function(){j.data=g.entityData,j.contextNode=j.data.datamap[g.currentEntity],j.graphLink=c.absUrl().replace("site","entity").replace("byEntity",j.contextNode.id)+"?link=false",j.iframeCode="<iframe src='"+j.graphLink+"' style='border:0; width: 1024; height: 90%;' seamless='true' ></iframe>";var a=_.groupBy(j.data.nodes,function(a){return a.type});j.stats={},angular.forEach(a,function(a,b){var c=g.getColor(b);void 0!==i.mapForward[b.toLowerCase()]&&(b=i.mapForward[b.toLowerCase()]);var d=_.sortBy(a,function(a){return a.name});j.stats[b]={entries:d,count:d.length,color:c}}),j.ready=!0,j.drawGraph()}),"false"===f.link&&(j.hideLinks=!0,j.removeClose=!0),j.selections=[],j.selectionData={},j.showIframeCode=!1;var l=function(){if("true"===j.sizeToParent){var b=angular.element(k[0].parentNode);j.w=b[0].clientWidth,j.h=.6*j.w}else j.w=a.innerWidth,j.h=a.innerHeight;j.w===a.innerWidth&&j.h===a.innerHeight?(j.showSidePanel=!0,j.sidepanelStyle={position:"fixed",top:"0px",left:.6*j.w+"px",width:.4*j.w+"px",height:j.h+"px",padding:"0px 10px","background-color":"white"},j.mainpanelStyle={position:"fixed",top:"0px",left:"0px",width:.6*j.w+"px",height:j.h+"px","background-color":"white",padding:"0px 0px 0px 15px"},j.svgWidth=.6*j.w-15):(j.showSidePanel=!1,j.mainpanelStyle={width:j.w+"px",height:j.h+"px"},j.svgWidth=j.w),j.statisticsPanelStyle={"border-radius":"4px",border:"solid 1px #ccc","background-color":"white",padding:"15px 15px 15px 15px",overflow:"auto","margin-top":"15px",height:j.h-30+"px"},d3.select("#entity_graph").select("svg").style("width",j.svgWidth).style("height",j.h)};l();var m=angular.element(a);m.bind("resize",function(){j.$apply(function(){l()})}),j.$on("colours-changed",function(){d3.select("#entity_graph").selectAll(".node").data();d3.select("#entity_graph").transition().duration(500).selectAll(".node").attr("fill",function(a){return g.getColor(a.type)}).style("stroke",function(a){return g.getColor(a.type)}),angular.forEach(j.stats,function(a,b){j.stats[b].color=i.types[b].color}),angular.forEach(j.data.types,function(a,b){j.data.types[b]=i.types[b].color})}),j.showDetails=function(a){if(-1===j.selections.indexOf(a.id)){d3.select("#entity_graph").selectAll(".text-landmark").remove(),d3.select("#entity_graph").select("#node_"+a.id).attr("stroke","black").attr("fill",g.getColor(a.type)),angular.forEach(j.selections,function(b){d3.select("#entity_graph").select("#link_"+b+"_"+a.id).style("stroke","black"),d3.select("#entity_graph").select("#link_"+a.id+"_"+b).style("stroke","black")});var c=h.determineLabelPosition("#entity_graph",a);d3.select("#entity_graph").select(".text-container").append("text").attr("x",c.x).attr("y",c.y).attr("id","text_"+a.id).attr("class","text").attr("font-size","20px").text(a.id),j.selections.push(a.id),j.showInfoPanel=!0;var d=i[i.service]+"/entity/"+g.site.code+"/data?q="+encodeURI(a.url);b.get(d).then(function(b){j.selectionData[a.id]=a,j.selectionData[a.id].summnote=b.data.summnote,j.selectionData[a.id].fullnote=b.data.fullnote},function(){})}else j.selections.splice(j.selections.indexOf(a.id),1),delete j.selectionData[a.id],d3.select("#entity_graph").select("#text_"+a.id).remove(),d3.select("#entity_graph").select("#node_"+a.id).attr("stroke",g.getColor(a.type)),angular.forEach(j.selections,function(b){d3.select("#entity_graph").select("#link_"+b+"_"+a.id).attr("stroke","#ccc"),d3.select("#entity_graph").select("#link_"+a.id+"_"+b).attr("stroke","#ccc")});0===j.selections.length?j.reset():(d3.select("#entity_graph").selectAll(".link").filter(function(){if("rgb(0, 0, 0)"===d3.select(this).style("stroke")){var a=d3.select(this).attr("id").split("link_")[1],b=a.split("_")[0],c=a.split("_")[1];if(-1===j.selections.indexOf(b)||-1===j.selections.indexOf(c))return!0}}).style("stroke","#ccc").style("opacity",i.opacity.unselected),d3.select("#entity_graph").selectAll(".node").style("opacity",function(a){return-1!==j.selections.indexOf(a.id)?i.opacity.default:i.opacity.unselected}),d3.select("#entity_graph").selectAll(".link").style("opacity",function(){return"rgb(0, 0, 0)"===d3.select(this).style("stroke")?i.opacity.default:i.opacity.unselected})),j.multiplePanels={activePanels:[j.selections.length-1]}},j.closeInfoPanel=function(){j.showInfoPanel=!1},j.reset=function(){d3.select("#entity_graph").transition().duration(250).selectAll(".node").attr("fill",function(a){return g.getColor(a.type)}).style("stroke",function(a){return g.getColor(a.type)}).style("opacity",i.opacity.default),d3.select("#entity_graph").transition().duration(250).selectAll(".link").style("stroke","#ccc").style("opacity",i.opacity.default),d3.select("#entity_graph").transition().duration(250).selectAll(".text").remove(),j.selections=[],j.selectionData={},j.closeInfoPanel(),j.labelMainEntities()},j.centerGraph=function(){if(j.force.alpha()>.004)e(function(){j.centerGraph()},200);else{var a=h.calculateTransformAndScale("#entity_graph");j.zoom.translate(a.translate).scale(a.scale),d3.select("#entity_graph").selectAll("g").transition().duration(500).attr("transform","translate("+a.translate+") scale("+a.scale+")"),j.labelMainEntities(),j.relaxed=!0
}},j.labelMainEntities=function(){h.renderLabels("#entity_graph")},j.drawGraph=function(){j.selections=[],j.selectionData={},d3.select("#entity_graph").select("svg").remove(),j.tickCounter=0;var a=function(){c.attr("d",function(a){var b=a.target.x-a.source.x,c=a.target.y-a.source.y,d=Math.sqrt(b*b+c*c);return"M"+a.source.x+","+a.source.y+"A"+d+","+d+" 0 0,1 "+a.target.x+","+a.target.y}),d.attr("transform",function(a){return"translate("+a.x+","+a.y+")"}),j.tickCounter+=1,2===j.tickCounter&&(j.tickCounter=0,j.$apply(function(){j.total=.1,j.processed=j.force.alpha()}))};j.redraw=function(){var a=d3.select("#entity_graph").select(".node-container");a.attr("transform","translate("+d3.event.translate+") scale("+d3.event.scale+")"),a=d3.select("#entity_graph").select(".text-container"),a.attr("transform","translate("+d3.event.translate+") scale("+d3.event.scale+")")},j.zoom=d3.behavior.zoom().scaleExtent([0,8]).on("zoom",j.redraw),j.force=d3.layout.force().nodes(j.data.nodes).links(j.data.links).charge(-2e3).linkDistance(200).linkStrength(1).size([j.svgWidth,j.h]).on("tick",a).start();var b=d3.select("#entity_graph").append("svg").attr("width",j.svgWidth).attr("height",j.h).attr("class","svg").attr("viewBox","0 0 "+j.svgWidth+" "+j.h).attr("preserveAspectRatio","xMinYMin meet").call(j.zoom).append("g").attr("class","node-container");d3.select("#entity_graph").select("svg").append("g").attr("class","text-container");var c=b.selectAll(".link").data(j.force.links()),d=b.selectAll(".node").data(j.force.nodes());c.enter().append("svg:path").attr("class","link").attr("id",function(a){return"link_"+a.sid+"_"+a.tid}),d.enter().append("circle").attr("id",function(a){return"node_"+a.id}).attr("class","node").attr("r",function(a){return a.r}).attr("fill",function(a){return g.getColor(a.type)}).on("click",function(a){j.$apply(function(){j.showDetails(a)})}),j.centerGraph()},j.close=function(){d.$broadcast("destroy-entity-network-view")},j.highlightFirstOrderConnections=function(){if(j.highlight=!j.highlight,j.highlight){var a=[];a.push(j.contextNode.id),d3.select("#entity_graph").selectAll(".link").attr("opacity",function(b){return b.sid===j.contextNode.id?(a.push(b.tid),i.opacity.default):b.tid===j.contextNode.id?(a.push(b.sid),i.opacity.default):i.opacity.unselected}),d3.select("#entity_graph").selectAll(".node").attr("fill",function(b){return-1!==a.indexOf(b.id)?g.getColor(b.type):"#ccc"}).attr("stroke",function(b){return-1!==a.indexOf(b.id)?g.getColor(b.type):"#ccc"}).attr("opacity",function(b){return-1!==a.indexOf(b.id)?i.opacity.default:void i.opacity.unselected})}else d3.select("#entity_graph").selectAll(".node").attr("fill",function(a){return g.getColor(a.type)}).attr("opacity",i.opacity.default),d3.select("#entity_graph").selectAll(".link").attr("opacity",i.opacity.default)}}}}]),angular.module("interfaceApp").controller("EntityCtrl",["$scope","$routeParams","$timeout","DataService",function(a,b,c,d){d.site={code:b.code},d.getEntityNetwork(b.entityId)}]),angular.module("interfaceApp").directive("colourPicker",["$rootScope","DataService","configuration",function(a,b,c){return{templateUrl:"views/colour-picker.html",restrict:"E",scope:{types:"="},link:function(d){d.showPicker=!1,d.showChooser=!1,d.custom={};var e=function(){d.colours={},angular.forEach(d.types,function(a,b){void 0!==c.mapForward[b.toLowerCase()]&&(b=c.mapForward[b.toLowerCase()]),d.colours[b]=c.types[b].color})};e(),d.pallette=c.pallette,d.toggleColourPicker=function(){e(),d.showPicker=!d.showPicker,d.showChooser=!1},d.changeColour=function(a){d.showPicker=!1,d.showChooser=!0,d.type=a},d.setColour=function(c){d.colours[d.type]=c,b.setColor(d.type,c),d.showPicker=!0,d.showChooser=!1,a.$broadcast("colours-changed")},d.save=function(){d.setColour(d.custom.colour),d.dismissChooser()},d.dismissChooser=function(){d.showPicker=!0,d.showChooser=!1}}}}]),angular.module("interfaceApp").directive("spinner",function(){return{template:'<div id="spinner"></div>',restrict:"E",scope:{colour:"@"},link:function(a,b){var c;c=void 0===a.colour?"white":a.colour;var d={lines:15,length:30,width:5,radius:30,corners:1,rotate:0,direction:1,color:c,speed:1,trail:60,shadow:!1,hwaccel:!0,className:"spinner",zIndex:2e9,top:"50%",left:"50%"},e=new Spinner(d).spin();b[0].appendChild(e.el)}}});