exports.id=468,exports.ids=[468],exports.modules={8718:(e,a,t)=>{Promise.resolve().then(t.bind(t,2943))},2943:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>f});var s=t(326),r=t(7577),l=t(5047),i=t(434),n=t(2592),d=t(3099),c=t(9031),o=t(1979),h=t(1272);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let m=(0,h.Z)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);var x=t(4611),y=t(3459),u=t(3861);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let p=(0,h.Z)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]),g=[{href:"/admin",icon:d.Z,label:"Dashboard",exact:!0},{href:"/admin/users",icon:c.Z,label:"Users",exact:!1},{href:"/admin/analytics",icon:o.Z,label:"Analytics",exact:!1},{href:"/admin/settings",icon:m,label:"Settings",exact:!1}];function f({children:e}){let a=(0,l.useRouter)(),t=(0,l.usePathname)(),[d,c]=(0,r.useState)(null),[o,h]=(0,r.useState)(!1),[m,f]=(0,r.useState)(!0),b=(e,a)=>a?t===e:t.startsWith(e);return m?s.jsx("div",{className:"min-h-screen flex items-center justify-center bg-gray-100",children:s.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"})}):d?(0,s.jsxs)("div",{className:"min-h-screen bg-gray-100",children:[s.jsx("button",{type:"button",onClick:()=>h(!0),className:"lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md","aria-label":"Open menu",children:s.jsx(x.Z,{className:"w-6 h-6 text-gray-700"})}),o&&s.jsx("div",{className:"lg:hidden fixed inset-0 bg-black/50 z-40",onClick:()=>h(!1)}),s.jsx("aside",{className:(0,n.W)("fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out","lg:translate-x-0",o?"translate-x-0":"-translate-x-full"),children:(0,s.jsxs)("div",{className:"flex flex-col h-full",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between p-4 border-b border-gray-800",children:[(0,s.jsxs)(i.default,{href:"/admin",className:"flex items-center gap-2",children:[s.jsx(y.Z,{className:"w-8 h-8 text-primary-400"}),s.jsx("span",{className:"text-xl font-bold",children:"Admin Panel"})]}),s.jsx("button",{type:"button",onClick:()=>h(!1),className:"lg:hidden p-2 hover:bg-gray-800 rounded-lg","aria-label":"Close menu",children:s.jsx(u.Z,{className:"w-5 h-5 text-gray-400"})})]}),(0,s.jsxs)("div",{className:"p-4 border-b border-gray-800",children:[s.jsx("p",{className:"text-sm text-gray-400",children:"Logged in as"}),s.jsx("p",{className:"font-medium truncate",children:d.email}),s.jsx("p",{className:"text-xs text-gray-500 mt-1 capitalize",children:d.role.replace("_"," ")})]}),s.jsx("nav",{className:"flex-1 p-4 space-y-1",children:g.map(e=>{let a=e.icon,t=b(e.href,e.exact);return(0,s.jsxs)(i.default,{href:e.href,onClick:()=>h(!1),className:(0,n.W)("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",t?"bg-primary-600 text-white":"text-gray-300 hover:bg-gray-800 hover:text-white"),children:[s.jsx(a,{className:"w-5 h-5"}),s.jsx("span",{className:"font-medium",children:e.label})]},e.href)})}),s.jsx("div",{className:"p-4 border-t border-gray-800",children:(0,s.jsxs)("button",{onClick:()=>{localStorage.removeItem("admin_access_token"),localStorage.removeItem("admin_user"),a.push("/admin/login")},className:"flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors",children:[s.jsx(p,{className:"w-5 h-5"}),s.jsx("span",{className:"font-medium",children:"Logout"})]})})]})}),s.jsx("main",{className:"flex-1 p-4 lg:p-8 pt-16 lg:pt-8",children:s.jsx("div",{className:"max-w-7xl mx-auto",children:e})})]}):null}},926:(e,a,t)=>{"use strict";t.d(a,{N:()=>r});var s=t(5137);let r={login:async e=>(await s.Z.post("/admin/login",e)).data,getDashboard:async()=>(await s.Z.get("/admin/dashboard")).data,listUsers:async e=>(await s.Z.get("/admin/users",{params:e})).data,getUser:async e=>(await s.Z.get(`/admin/users/${e}`)).data,updateUserStatus:async(e,a)=>(await s.Z.patch(`/admin/users/${e}/status`,{is_active:a})).data}},5137:(e,a,t)=>{"use strict";t.d(a,{Z:()=>i});var s=t(6863);let r=process.env.NEXT_PUBLIC_API_URL||"http://localhost:3100",l=s.Z.create({baseURL:`${r}/api/v1`,withCredentials:!0,headers:{"Content-Type":"application/json"}});l.interceptors.request.use(e=>(e.url?.startsWith("/admin"),e),e=>Promise.reject(e)),l.interceptors.response.use(e=>e,async e=>{let a=e.config;if(e.response?.status===401&&!a._retry){a._retry=!0;try{return await l.post("/auth/refresh"),l(a)}catch(e){return Promise.reject(e)}}return Promise.reject(e)});let i=l},1272:(e,a,t)=>{"use strict";t.d(a,{Z:()=>d});var s=t(7577);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),l=(...e)=>e.filter((e,a,t)=>!!e&&t.indexOf(e)===a).join(" ");/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,s.forwardRef)(({color:e="currentColor",size:a=24,strokeWidth:t=2,absoluteStrokeWidth:r,className:n="",children:d,iconNode:c,...o},h)=>(0,s.createElement)("svg",{ref:h,...i,width:a,height:a,stroke:e,strokeWidth:r?24*Number(t)/Number(a):t,className:l("lucide",n),...o},[...c.map(([e,a])=>(0,s.createElement)(e,a)),...Array.isArray(d)?d:[d]])),d=(e,a)=>{let t=(0,s.forwardRef)(({className:t,...i},d)=>(0,s.createElement)(n,{ref:d,iconNode:a,className:l(`lucide-${r(e)}`,t),...i}));return t.displayName=`${e}`,t}},1979:(e,a,t)=>{"use strict";t.d(a,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,t(1272).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},3099:(e,a,t)=>{"use strict";t.d(a,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,t(1272).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},4611:(e,a,t)=>{"use strict";t.d(a,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,t(1272).Z)("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]])},3459:(e,a,t)=>{"use strict";t.d(a,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,t(1272).Z)("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},9031:(e,a,t)=>{"use strict";t.d(a,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,t(1272).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},3861:(e,a,t)=>{"use strict";t.d(a,{Z:()=>s});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,t(1272).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},9457:(e,a,t)=>{"use strict";t.r(a),t.d(a,{$$typeof:()=>i,__esModule:()=>l,default:()=>n});var s=t(8570);let r=(0,s.createProxy)(String.raw`/home/benito/Desktop/Ben/Benify/apps/web/src/app/admin/layout.tsx`),{__esModule:l,$$typeof:i}=r;r.default;let n=(0,s.createProxy)(String.raw`/home/benito/Desktop/Ben/Benify/apps/web/src/app/admin/layout.tsx#default`)}};