"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[817],{7138:function(e,t,n){n.d(t,{default:function(){return r.a}});var a=n(231),r=n.n(a)},8569:function(e,t,n){n.d(t,{Y:function(){return b}});var a=n(7437),r=n(2265),i=n(8087),s=n(7138),c=n(6463),o=n(4399),l=n(5811),u=n(5663),d=n(7815),h=n(2107),f=n(6151),y=n(3393),p=n(4817),m=n(8640),v=n(2490),x=n(2742),g=n(5188);let k=[{href:"/dashboard",icon:l.Z,labelKey:"nav.dashboard"},{href:"/study",icon:u.Z,labelKey:"nav.study"},{href:"/tests",icon:d.Z,labelKey:"nav.tests"},{href:"/physical",icon:h.Z,labelKey:"nav.physical"},{href:"/documents",icon:f.Z,labelKey:"nav.documents"},{href:"/analytics",icon:y.Z,labelKey:"nav.analytics"},{href:"/community",icon:p.Z,labelKey:"nav.community"},{href:"/profile",icon:m.Z,labelKey:"nav.profile"}];function b(e){let{locale:t}=e,n=(0,i.useTranslations)(),l=(0,c.usePathname)(),[u,d]=(0,r.useState)(!1),h=e=>l===e||l.startsWith(e+"/");return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("button",{type:"button",onClick:()=>d(!0),className:"lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md","aria-label":n("dashboard.menu"),children:(0,a.jsx)(v.Z,{className:"w-6 h-6 text-gray-700"})}),u&&(0,a.jsx)("div",{className:"lg:hidden fixed inset-0 bg-black/50 z-40",onClick:()=>d(!1)}),(0,a.jsx)("aside",{className:(0,o.W)("fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out","lg:translate-x-0",u?"translate-x-0":"-translate-x-full"),children:(0,a.jsxs)("div",{className:"flex flex-col h-full",children:[(0,a.jsxs)("div",{className:"flex items-center justify-between p-4 border-b",children:[(0,a.jsxs)(s.default,{href:"/dashboard",className:"flex items-center gap-2",children:[(0,a.jsx)(x.Z,{className:"w-8 h-8 text-primary-600"}),(0,a.jsx)("span",{className:"text-xl font-bold text-primary-600",children:n("common.appName")})]}),(0,a.jsx)("button",{type:"button",onClick:()=>d(!1),className:"lg:hidden p-2 hover:bg-gray-100 rounded-lg","aria-label":n("dashboard.closeMenu"),children:(0,a.jsx)(g.Z,{className:"w-5 h-5 text-gray-500"})})]}),(0,a.jsx)("nav",{className:"flex-1 p-4 space-y-1",children:k.map(e=>{let r=e.icon,i=h(e.href);return(0,a.jsxs)(s.default,{href:"/".concat(t).concat(e.href),onClick:()=>d(!1),className:(0,o.W)("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",i?"bg-primary-50 text-primary-700":"text-gray-700 hover:bg-gray-50"),children:[(0,a.jsx)(r,{className:(0,o.W)("w-5 h-5",i?"text-primary-600":"text-gray-500")}),(0,a.jsx)("span",{className:"font-medium",children:n(e.labelKey)})]},e.href)})}),(0,a.jsx)("div",{className:"p-4 border-t",children:(0,a.jsx)(s.default,{href:"/logout",className:"flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors",children:(0,a.jsx)("span",{className:"text-lg font-medium",children:n("nav.logout")})})})]})})]})}},1013:function(e,t,n){var a=n(1787);let r=n(357).env.NEXT_PUBLIC_API_URL||"http://localhost:3100",i=a.Z.create({baseURL:"".concat(r,"/api/v1"),withCredentials:!0,headers:{"Content-Type":"application/json"}});i.interceptors.request.use(e=>{var t;if(null===(t=e.url)||void 0===t?void 0:t.startsWith("/admin")){let t=localStorage.getItem("admin_access_token");t&&(e.headers.Authorization="Bearer ".concat(t))}return e},e=>Promise.reject(e)),i.interceptors.response.use(e=>e,async e=>{var t;let n=e.config;if((null===(t=e.response)||void 0===t?void 0:t.status)===401&&!n._retry){n._retry=!0;try{return await i.post("/auth/refresh"),i(n)}catch(e){return window.location.href="/login",Promise.reject(e)}}return Promise.reject(e)}),t.Z=i},7185:function(e,t,n){n.d(t,{$m:function(){return o},DG:function(){return i},DM:function(){return u},Hp:function(){return r},PP:function(){return l},WS:function(){return h},_D:function(){return d},lg:function(){return c},vO:function(){return f},vv:function(){return s}});var a=n(1013);async function r(e){return(await a.Z.get("/discussions",{params:e})).data}async function i(e){return(await a.Z.get("/discussions/".concat(e))).data}async function s(e){return(await a.Z.post("/discussions",e)).data}async function c(e){return(await a.Z.delete("/discussions/".concat(e))).data}async function o(e){return(await a.Z.get("/discussions/".concat(e,"/replies"))).data}async function l(e,t){return(await a.Z.post("/discussions/".concat(e,"/replies"),t)).data}async function u(e){return(await a.Z.post("/discussions/".concat(e,"/upvote"))).data}async function d(e){return(await a.Z.post("/discussions/replies/".concat(e,"/upvote"))).data}async function h(e,t){return(await a.Z.patch("/discussions/".concat(e,"/accepted-answer"),t)).data}let f=["General Intelligence","Reasoning","Mathematics","General Knowledge","English","Current Affairs","Physical","Interview","Other"]},4282:function(e,t,n){n.d(t,{k:function(){return r}});var a=n(357);async function r(){var e,t;let n=await fetch((e="/api/v1/auth/me","".concat(((null===(t=a.env.NEXT_PUBLIC_API_URL)||void 0===t?void 0:t.trim())||"http://localhost:3100").replace(/\/+$/,"")).concat(e)),{credentials:"include"});if(401===n.status)return null;let r=await n.json();if(!n.ok)throw Error(r.detail||"Request failed");return{sub:r.id,email:r.email,name:r.name,picture:r.avatar_url}}},1827:function(e,t,n){n.d(t,{Z:function(){return o}});var a=n(2265);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),i=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return t.filter((e,t,n)=>!!e&&n.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var s={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let c=(0,a.forwardRef)((e,t)=>{let{color:n="currentColor",size:r=24,strokeWidth:c=2,absoluteStrokeWidth:o,className:l="",children:u,iconNode:d,...h}=e;return(0,a.createElement)("svg",{ref:t,...s,width:r,height:r,stroke:n,strokeWidth:o?24*Number(c)/Number(r):c,className:i("lucide",l),...h},[...d.map(e=>{let[t,n]=e;return(0,a.createElement)(t,n)}),...Array.isArray(u)?u:[u]])}),o=(e,t)=>{let n=(0,a.forwardRef)((n,s)=>{let{className:o,...l}=n;return(0,a.createElement)(c,{ref:s,iconNode:t,className:i("lucide-".concat(r(e)),o),...l})});return n.displayName="".concat(e),n}},2107:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]])},3393:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},5663:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("BookOpen",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]])},6151:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("FileCheck",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m9 15 2 2 4-4",key:"1grp1n"}]])},7815:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},2742:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("Flame",[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]])},5811:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},2490:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]])},8640:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},4817:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},5188:function(e,t,n){n.d(t,{Z:function(){return a}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,n(1827).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},4399:function(e,t,n){n.d(t,{W:function(){return a}});function a(){for(var e,t,n=0,a="",r=arguments.length;n<r;n++)(e=arguments[n])&&(t=function e(t){var n,a,r="";if("string"==typeof t||"number"==typeof t)r+=t;else if("object"==typeof t){if(Array.isArray(t)){var i=t.length;for(n=0;n<i;n++)t[n]&&(a=e(t[n]))&&(r&&(r+=" "),r+=a)}else for(a in t)t[a]&&(r&&(r+=" "),r+=a)}return r}(e))&&(a&&(a+=" "),a+=t);return a}}}]);