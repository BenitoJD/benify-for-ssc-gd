exports.id=625,exports.ids=[625],exports.modules={68718:(e,t,a)=>{Promise.resolve().then(a.bind(a,2943))},35047:(e,t,a)=>{"use strict";a.r(t);var s=a(77389),r={};for(let e in s)"default"!==e&&(r[e]=()=>s[e]);a.d(t,r)},2943:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>M});var s=a(10326),r=a(17577),l=a(35047),i=a(90434),n=a(12592),c=a(23099),d=a(19031),o=a(52443),h=a(56235),x=a(38194),y=a(12066),m=a(65944),p=a(64645),u=a(61979),f=a(71272);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let g=(0,f.Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);var b=a(94611),k=a(73459),v=a(23861);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let j=(0,f.Z)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]),w=[{href:"/admin",icon:c.Z,label:"Dashboard",exact:!0},{href:"/admin/users",icon:d.Z,label:"Users",exact:!1}],N=[{href:"/admin/content",icon:o.Z,label:"Content",exact:!0},{href:"/admin/content/subjects",icon:h.Z,label:"Subjects",exact:!1},{href:"/admin/content/topics",icon:x.Z,label:"Topics",exact:!1},{href:"/admin/content/lessons",icon:y.Z,label:"Lessons",exact:!1},{href:"/admin/content/questions",icon:m.Z,label:"Questions",exact:!1},{href:"/admin/content/test-series",icon:p.Z,label:"Test Series",exact:!1}],Z=[{href:"/admin/analytics",icon:u.Z,label:"Analytics",exact:!1},{href:"/admin/settings",icon:g,label:"Settings",exact:!1}];function M({children:e}){let t=(0,l.useRouter)(),a=(0,l.usePathname)(),[c,d]=(0,r.useState)(null),[o,h]=(0,r.useState)(!1),[x,y]=(0,r.useState)(!0),m=(e,t)=>t?a===e:a.startsWith(e);return x?s.jsx("div",{className:"min-h-screen flex items-center justify-center bg-gray-100",children:s.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"})}):c?(0,s.jsxs)("div",{className:"min-h-screen bg-gray-100",children:[s.jsx("button",{type:"button",onClick:()=>h(!0),className:"lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md","aria-label":"Open menu",children:s.jsx(b.Z,{className:"w-6 h-6 text-gray-700"})}),o&&s.jsx("div",{className:"lg:hidden fixed inset-0 bg-black/50 z-40",onClick:()=>h(!1)}),s.jsx("aside",{className:(0,n.W)("fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out","lg:translate-x-0",o?"translate-x-0":"-translate-x-full"),children:(0,s.jsxs)("div",{className:"flex flex-col h-full",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between p-4 border-b border-gray-800",children:[(0,s.jsxs)(i.default,{href:"/admin",className:"flex items-center gap-2",children:[s.jsx(k.Z,{className:"w-8 h-8 text-primary-400"}),s.jsx("span",{className:"text-xl font-bold",children:"Admin Panel"})]}),s.jsx("button",{type:"button",onClick:()=>h(!1),className:"lg:hidden p-2 hover:bg-gray-800 rounded-lg","aria-label":"Close menu",children:s.jsx(v.Z,{className:"w-5 h-5 text-gray-400"})})]}),(0,s.jsxs)("div",{className:"p-4 border-b border-gray-800",children:[s.jsx("p",{className:"text-sm text-gray-400",children:"Logged in as"}),s.jsx("p",{className:"font-medium truncate",children:c.email}),s.jsx("p",{className:"text-xs text-gray-500 mt-1 capitalize",children:c.role.replace("_"," ")})]}),(0,s.jsxs)("nav",{className:"flex-1 p-4 space-y-6 overflow-y-auto",children:[(0,s.jsxs)("div",{className:"space-y-1",children:[s.jsx("p",{className:"px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2",children:"Main"}),w.map(e=>{let t=e.icon,a=m(e.href,e.exact);return(0,s.jsxs)(i.default,{href:e.href,onClick:()=>h(!1),className:(0,n.W)("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",a?"bg-primary-600 text-white":"text-gray-300 hover:bg-gray-800 hover:text-white"),children:[s.jsx(t,{className:"w-5 h-5"}),s.jsx("span",{className:"font-medium",children:e.label})]},e.href)})]}),(0,s.jsxs)("div",{className:"space-y-1",children:[s.jsx("p",{className:"px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2",children:"Content"}),N.map(e=>{let t=e.icon,a=m(e.href,e.exact);return(0,s.jsxs)(i.default,{href:e.href,onClick:()=>h(!1),className:(0,n.W)("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",a?"bg-primary-600 text-white":"text-gray-300 hover:bg-gray-800 hover:text-white"),children:[s.jsx(t,{className:"w-5 h-5"}),s.jsx("span",{className:"font-medium",children:e.label})]},e.href)})]}),(0,s.jsxs)("div",{className:"space-y-1",children:[s.jsx("p",{className:"px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2",children:"Admin"}),Z.map(e=>{let t=e.icon,a=m(e.href,e.exact);return(0,s.jsxs)(i.default,{href:e.href,onClick:()=>h(!1),className:(0,n.W)("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",a?"bg-primary-600 text-white":"text-gray-300 hover:bg-gray-800 hover:text-white"),children:[s.jsx(t,{className:"w-5 h-5"}),s.jsx("span",{className:"font-medium",children:e.label})]},e.href)})]})]}),s.jsx("div",{className:"p-4 border-t border-gray-800",children:(0,s.jsxs)("button",{onClick:()=>{localStorage.removeItem("admin_access_token"),localStorage.removeItem("admin_user"),t.push("/admin/login")},className:"flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors",children:[s.jsx(j,{className:"w-5 h-5"}),s.jsx("span",{className:"font-medium",children:"Logout"})]})})]})}),s.jsx("main",{className:"flex-1 p-4 lg:p-8 pt-16 lg:pt-8",children:s.jsx("div",{className:"max-w-7xl mx-auto",children:e})})]}):null}},71272:(e,t,a)=>{"use strict";a.d(t,{Z:()=>c});var s=a(17577);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),l=(...e)=>e.filter((e,t,a)=>!!e&&a.indexOf(e)===t).join(" ");/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s.forwardRef)(({color:e="currentColor",size:t=24,strokeWidth:a=2,absoluteStrokeWidth:r,className:n="",children:c,iconNode:d,...o},h)=>(0,s.createElement)("svg",{ref:h,...i,width:t,height:t,stroke:e,strokeWidth:r?24*Number(a)/Number(t):a,className:l("lucide",n),...o},[...d.map(([e,t])=>(0,s.createElement)(e,t)),...Array.isArray(c)?c:[c]])),c=(e,t)=>{let a=(0,s.forwardRef)(({className:a,...i},c)=>(0,s.createElement)(n,{ref:c,iconNode:t,className:l(`lucide-${r(e)}`,a),...i}));return a.displayName=`${e}`,a}},61979:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},52443:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("BookOpen",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]])},65944:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]])},64645:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("ClipboardList",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]])},12066:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("FileCheck",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m9 15 2 2 4-4",key:"1grp1n"}]])},56235:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},23099:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},38194:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("List",[["line",{x1:"8",x2:"21",y1:"6",y2:"6",key:"7ey8pc"}],["line",{x1:"8",x2:"21",y1:"12",y2:"12",key:"rjfblc"}],["line",{x1:"8",x2:"21",y1:"18",y2:"18",key:"c3b1m8"}],["line",{x1:"3",x2:"3.01",y1:"6",y2:"6",key:"1g7gq3"}],["line",{x1:"3",x2:"3.01",y1:"12",y2:"12",key:"1pjlvk"}],["line",{x1:"3",x2:"3.01",y1:"18",y2:"18",key:"28t2mc"}]])},94611:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]])},73459:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},19031:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},23861:(e,t,a)=>{"use strict";a.d(t,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,a(71272).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},9457:(e,t,a)=>{"use strict";a.r(t),a.d(t,{$$typeof:()=>i,__esModule:()=>l,default:()=>n});var s=a(68570);let r=(0,s.createProxy)(String.raw`/home/benito/Desktop/Ben/Benify/apps/web/src/app/admin/layout.tsx`),{__esModule:l,$$typeof:i}=r;r.default;let n=(0,s.createProxy)(String.raw`/home/benito/Desktop/Ben/Benify/apps/web/src/app/admin/layout.tsx#default`)},12592:(e,t,a)=>{"use strict";function s(){for(var e,t,a=0,s="",r=arguments.length;a<r;a++)(e=arguments[a])&&(t=function e(t){var a,s,r="";if("string"==typeof t||"number"==typeof t)r+=t;else if("object"==typeof t){if(Array.isArray(t)){var l=t.length;for(a=0;a<l;a++)t[a]&&(s=e(t[a]))&&(r&&(r+=" "),r+=s)}else for(s in t)t[s]&&(r&&(r+=" "),r+=s)}return r}(e))&&(s&&(s+=" "),s+=t);return s}a.d(t,{W:()=>s})}};