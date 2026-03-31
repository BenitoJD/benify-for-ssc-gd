(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[91],{3879:function(e,t,a){Promise.resolve().then(a.bind(a,594))},7138:function(e,t,a){"use strict";a.d(t,{default:function(){return n.a}});var r=a(231),n=a.n(r)},594:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return p}});var r=a(7437),n=a(2265),l=a(6463),s=a(7138),i=a(4399),c=a(5811),o=a(4817),d=a(3393),u=a(1827);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let h=(0,u.Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);var f=a(2490),m=a(2375),x=a(5188);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let y=(0,u.Z)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]),g=[{href:"/admin",icon:c.Z,label:"Dashboard",exact:!0},{href:"/admin/users",icon:o.Z,label:"Users",exact:!1},{href:"/admin/analytics",icon:d.Z,label:"Analytics",exact:!1},{href:"/admin/settings",icon:h,label:"Settings",exact:!1}];function p(e){let{children:t}=e,a=(0,l.useRouter)(),c=(0,l.usePathname)(),[o,d]=(0,n.useState)(null),[u,h]=(0,n.useState)(!1),[p,b]=(0,n.useState)(!0);(0,n.useEffect)(()=>{let e=localStorage.getItem("admin_access_token"),t=localStorage.getItem("admin_user");if(!e||!t){a.push("/admin/login");return}try{let e=JSON.parse(t);if("admin"!==e.role&&"super_admin"!==e.role){a.push("/admin/login");return}d(e)}catch(e){a.push("/admin/login")}finally{b(!1)}},[a]);let k=(e,t)=>t?c===e:c.startsWith(e);return p?(0,r.jsx)("div",{className:"min-h-screen flex items-center justify-center bg-gray-100",children:(0,r.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"})}):o?(0,r.jsxs)("div",{className:"min-h-screen bg-gray-100",children:[(0,r.jsx)("button",{type:"button",onClick:()=>h(!0),className:"lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md","aria-label":"Open menu",children:(0,r.jsx)(f.Z,{className:"w-6 h-6 text-gray-700"})}),u&&(0,r.jsx)("div",{className:"lg:hidden fixed inset-0 bg-black/50 z-40",onClick:()=>h(!1)}),(0,r.jsx)("aside",{className:(0,i.W)("fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out","lg:translate-x-0",u?"translate-x-0":"-translate-x-full"),children:(0,r.jsxs)("div",{className:"flex flex-col h-full",children:[(0,r.jsxs)("div",{className:"flex items-center justify-between p-4 border-b border-gray-800",children:[(0,r.jsxs)(s.default,{href:"/admin",className:"flex items-center gap-2",children:[(0,r.jsx)(m.Z,{className:"w-8 h-8 text-primary-400"}),(0,r.jsx)("span",{className:"text-xl font-bold",children:"Admin Panel"})]}),(0,r.jsx)("button",{type:"button",onClick:()=>h(!1),className:"lg:hidden p-2 hover:bg-gray-800 rounded-lg","aria-label":"Close menu",children:(0,r.jsx)(x.Z,{className:"w-5 h-5 text-gray-400"})})]}),(0,r.jsxs)("div",{className:"p-4 border-b border-gray-800",children:[(0,r.jsx)("p",{className:"text-sm text-gray-400",children:"Logged in as"}),(0,r.jsx)("p",{className:"font-medium truncate",children:o.email}),(0,r.jsx)("p",{className:"text-xs text-gray-500 mt-1 capitalize",children:o.role.replace("_"," ")})]}),(0,r.jsx)("nav",{className:"flex-1 p-4 space-y-1",children:g.map(e=>{let t=e.icon,a=k(e.href,e.exact);return(0,r.jsxs)(s.default,{href:e.href,onClick:()=>h(!1),className:(0,i.W)("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",a?"bg-primary-600 text-white":"text-gray-300 hover:bg-gray-800 hover:text-white"),children:[(0,r.jsx)(t,{className:"w-5 h-5"}),(0,r.jsx)("span",{className:"font-medium",children:e.label})]},e.href)})}),(0,r.jsx)("div",{className:"p-4 border-t border-gray-800",children:(0,r.jsxs)("button",{onClick:()=>{localStorage.removeItem("admin_access_token"),localStorage.removeItem("admin_user"),a.push("/admin/login")},className:"flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors",children:[(0,r.jsx)(y,{className:"w-5 h-5"}),(0,r.jsx)("span",{className:"font-medium",children:"Logout"})]})})]})}),(0,r.jsx)("main",{className:"flex-1 p-4 lg:p-8 pt-16 lg:pt-8",children:(0,r.jsx)("div",{className:"max-w-7xl mx-auto",children:t})})]}):null}},1827:function(e,t,a){"use strict";a.d(t,{Z:function(){return c}});var r=a(2265);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),l=function(){for(var e=arguments.length,t=Array(e),a=0;a<e;a++)t[a]=arguments[a];return t.filter((e,t,a)=>!!e&&a.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var s={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let i=(0,r.forwardRef)((e,t)=>{let{color:a="currentColor",size:n=24,strokeWidth:i=2,absoluteStrokeWidth:c,className:o="",children:d,iconNode:u,...h}=e;return(0,r.createElement)("svg",{ref:t,...s,width:n,height:n,stroke:a,strokeWidth:c?24*Number(i)/Number(n):i,className:l("lucide",o),...h},[...u.map(e=>{let[t,a]=e;return(0,r.createElement)(t,a)}),...Array.isArray(d)?d:[d]])}),c=(e,t)=>{let a=(0,r.forwardRef)((a,s)=>{let{className:c,...o}=a;return(0,r.createElement)(i,{ref:s,iconNode:t,className:l("lucide-".concat(n(e)),c),...o})});return a.displayName="".concat(e),a}},3393:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(1827).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},5811:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(1827).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},2490:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(1827).Z)("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]])},2375:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(1827).Z)("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},4817:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(1827).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},5188:function(e,t,a){"use strict";a.d(t,{Z:function(){return r}});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(1827).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},4399:function(e,t,a){"use strict";function r(){for(var e,t,a=0,r="",n=arguments.length;a<n;a++)(e=arguments[a])&&(t=function e(t){var a,r,n="";if("string"==typeof t||"number"==typeof t)n+=t;else if("object"==typeof t){if(Array.isArray(t)){var l=t.length;for(a=0;a<l;a++)t[a]&&(r=e(t[a]))&&(n&&(n+=" "),n+=r)}else for(r in t)t[r]&&(n&&(n+=" "),n+=r)}return n}(e))&&(r&&(r+=" "),r+=t);return r}a.d(t,{W:function(){return r}})}},function(e){e.O(0,[56,971,23,744],function(){return e(e.s=3879)}),_N_E=e.O()}]);