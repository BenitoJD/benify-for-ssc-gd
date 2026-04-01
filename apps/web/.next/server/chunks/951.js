"use strict";exports.id=951,exports.ids=[951],exports.modules={5549:(e,t,a)=>{a.d(t,{Y:()=>b});var r=a(10326),s=a(17577),n=a(23844),l=a(90434),i=a(35047),d=a(12592),o=a(23099),c=a(52443),h=a(56235),y=a(580),p=a(12066),u=a(61979),f=a(19031),x=a(9094),m=a(94611),v=a(74002),g=a(23861);let k=[{href:"/dashboard",icon:o.Z,labelKey:"nav.dashboard"},{href:"/study",icon:c.Z,labelKey:"nav.study"},{href:"/tests",icon:h.Z,labelKey:"nav.tests"},{href:"/physical",icon:y.Z,labelKey:"nav.physical"},{href:"/documents",icon:p.Z,labelKey:"nav.documents"},{href:"/analytics",icon:u.Z,labelKey:"nav.analytics"},{href:"/community",icon:f.Z,labelKey:"nav.community"},{href:"/profile",icon:x.Z,labelKey:"nav.profile"}];function b({locale:e}){let t=(0,n.useTranslations)(),a=(0,i.usePathname)(),[o,c]=(0,s.useState)(!1),h=e=>a===e||a.startsWith(e+"/");return(0,r.jsxs)(r.Fragment,{children:[r.jsx("button",{type:"button",onClick:()=>c(!0),className:"lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md","aria-label":t("dashboard.menu"),children:r.jsx(m.Z,{className:"w-6 h-6 text-gray-700"})}),o&&r.jsx("div",{className:"lg:hidden fixed inset-0 bg-black/50 z-40",onClick:()=>c(!1)}),r.jsx("aside",{className:(0,d.W)("fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out","lg:translate-x-0",o?"translate-x-0":"-translate-x-full"),children:(0,r.jsxs)("div",{className:"flex flex-col h-full",children:[(0,r.jsxs)("div",{className:"flex items-center justify-between p-4 border-b",children:[(0,r.jsxs)(l.default,{href:"/dashboard",className:"flex items-center gap-2",children:[r.jsx(v.Z,{className:"w-8 h-8 text-primary-600"}),r.jsx("span",{className:"text-xl font-bold text-primary-600",children:t("common.appName")})]}),r.jsx("button",{type:"button",onClick:()=>c(!1),className:"lg:hidden p-2 hover:bg-gray-100 rounded-lg","aria-label":t("dashboard.closeMenu"),children:r.jsx(g.Z,{className:"w-5 h-5 text-gray-500"})})]}),r.jsx("nav",{className:"flex-1 p-4 space-y-1",children:k.map(a=>{let s=a.icon,n=h(a.href);return(0,r.jsxs)(l.default,{href:`/${e}${a.href}`,onClick:()=>c(!1),className:(0,d.W)("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",n?"bg-primary-50 text-primary-700":"text-gray-700 hover:bg-gray-50"),children:[r.jsx(s,{className:(0,d.W)("w-5 h-5",n?"text-primary-600":"text-gray-500")}),r.jsx("span",{className:"font-medium",children:t(a.labelKey)})]},a.href)})}),r.jsx("div",{className:"p-4 border-t",children:r.jsx(l.default,{href:"/logout",className:"flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors",children:r.jsx("span",{className:"text-lg font-medium",children:t("nav.logout")})})})]})})]})}},55137:(e,t,a)=>{a.d(t,{Z:()=>l});var r=a(66863);let s=process.env.NEXT_PUBLIC_API_URL||"http://localhost:3100",n=r.Z.create({baseURL:`${s}/api/v1`,withCredentials:!0,headers:{"Content-Type":"application/json"}});n.interceptors.request.use(e=>(e.url?.startsWith("/admin"),e),e=>Promise.reject(e)),n.interceptors.response.use(e=>e,async e=>{let t=e.config;if(e.response?.status===401&&!t._retry){t._retry=!0;try{return await n.post("/auth/refresh"),n(t)}catch(e){return Promise.reject(e)}}return Promise.reject(e)});let l=n},84991:(e,t,a)=>{a.d(t,{DM:()=>i,PP:()=>l,WS:()=>o,_D:()=>d,lg:()=>n,vO:()=>c,vv:()=>s});var r=a(55137);async function s(e){return(await r.Z.post("/discussions",e)).data}async function n(e){return(await r.Z.delete(`/discussions/${e}`)).data}async function l(e,t){return(await r.Z.post(`/discussions/${e}/replies`,t)).data}async function i(e){return(await r.Z.post(`/discussions/${e}/upvote`)).data}async function d(e){return(await r.Z.post(`/discussions/replies/${e}/upvote`)).data}async function o(e,t){return(await r.Z.patch(`/discussions/${e}/accepted-answer`,t)).data}let c=["General Intelligence","Reasoning","Mathematics","General Knowledge","English","Current Affairs","Physical","Interview","Other"]},71272:(e,t,a)=>{a.d(t,{Z:()=>d});var r=a(17577);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),n=(...e)=>e.filter((e,t,a)=>!!e&&a.indexOf(e)===t).join(" ");/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var l={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,r.forwardRef)(({color:e="currentColor",size:t=24,strokeWidth:a=2,absoluteStrokeWidth:s,className:i="",children:d,iconNode:o,...c},h)=>(0,r.createElement)("svg",{ref:h,...l,width:t,height:t,stroke:e,strokeWidth:s?24*Number(a)/Number(t):a,className:n("lucide",i),...c},[...o.map(([e,t])=>(0,r.createElement)(e,t)),...Array.isArray(d)?d:[d]])),d=(e,t)=>{let a=(0,r.forwardRef)(({className:a,...l},d)=>(0,r.createElement)(i,{ref:d,iconNode:t,className:n(`lucide-${s(e)}`,a),...l}));return a.displayName=`${e}`,a}},580:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]])},61979:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},52443:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("BookOpen",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]])},12066:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("FileCheck",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m9 15 2 2 4-4",key:"1grp1n"}]])},56235:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},74002:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Flame",[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]])},23099:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},94611:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]])},9094:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},19031:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},23861:(e,t,a)=>{a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},12592:(e,t,a)=>{a.d(t,{W:()=>r});function r(){for(var e,t,a=0,r="",s=arguments.length;a<s;a++)(e=arguments[a])&&(t=function e(t){var a,r,s="";if("string"==typeof t||"number"==typeof t)s+=t;else if("object"==typeof t){if(Array.isArray(t)){var n=t.length;for(a=0;a<n;a++)t[a]&&(r=e(t[a]))&&(s&&(s+=" "),s+=r)}else for(r in t)t[r]&&(s&&(s+=" "),s+=r)}return s}(e))&&(r&&(r+=" "),r+=t);return r}}};