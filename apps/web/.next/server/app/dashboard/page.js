(()=>{var e={};e.id=702,e.ids=[702],e.modules={47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},39491:e=>{"use strict";e.exports=require("assert")},6113:e=>{"use strict";e.exports=require("crypto")},82361:e=>{"use strict";e.exports=require("events")},57147:e=>{"use strict";e.exports=require("fs")},13685:e=>{"use strict";e.exports=require("http")},85158:e=>{"use strict";e.exports=require("http2")},95687:e=>{"use strict";e.exports=require("https")},22037:e=>{"use strict";e.exports=require("os")},71017:e=>{"use strict";e.exports=require("path")},12781:e=>{"use strict";e.exports=require("stream")},76224:e=>{"use strict";e.exports=require("tty")},57310:e=>{"use strict";e.exports=require("url")},73837:e=>{"use strict";e.exports=require("util")},59796:e=>{"use strict";e.exports=require("zlib")},58775:(e,t,a)=>{"use strict";a.r(t),a.d(t,{GlobalError:()=>i.a,__next_app__:()=>h,originalPathname:()=>p,pages:()=>d,routeModule:()=>u,tree:()=>c}),a(38256),a(64968),a(35866);var r=a(23191),s=a(88716),n=a(37922),i=a.n(n),o=a(95231),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);a.d(t,l);let c=["",{children:["dashboard",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,38256)),"/home/benito/Desktop/Ben/Benify/apps/web/src/app/dashboard/page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(a.bind(a,64968)),"/home/benito/Desktop/Ben/Benify/apps/web/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,35866,23)),"next/dist/client/components/not-found-error"]}],d=["/home/benito/Desktop/Ben/Benify/apps/web/src/app/dashboard/page.tsx"],p="/dashboard/page",h={require:a,loadChunk:()=>Promise.resolve()},u=new r.AppPageRouteModule({definition:{kind:s.x.APP_PAGE,page:"/dashboard/page",pathname:"/dashboard",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},78919:(e,t,a)=>{Promise.resolve().then(a.bind(a,61175))},61175:(e,t,a)=>{"use strict";let r,s,n;a.r(t),a.d(t,{default:()=>au});var i,o,l,c=a(10326),d=a(17577),p=a(23844),h=a(35047),u=a(5549),m=a(21303);function f({targetDate:e}){let t=(0,p.useTranslations)("dashboard"),[a,r]=(0,d.useState)(()=>(function(e){let t=e.getTime()-new Date().getTime();return t<=0?{days:0,hours:0,minutes:0,seconds:0}:{days:Math.floor(t/864e5),hours:Math.floor(t/36e5%24),minutes:Math.floor(t/6e4%60),seconds:Math.floor(t/1e3%60)}})(e));return(0,c.jsxs)("div",{className:"bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white",children:[(0,c.jsxs)("div",{className:"flex items-center gap-3 mb-4",children:[c.jsx(m.Z,{className:"w-6 h-6"}),c.jsx("h2",{className:"text-lg font-semibold",children:t("examCountdown")})]}),(0,c.jsxs)("div",{className:"grid grid-cols-4 gap-3",children:[(0,c.jsxs)("div",{className:"bg-white/20 backdrop-blur rounded-xl p-3 text-center",children:[c.jsx("div",{className:"text-3xl font-bold",children:a.days}),c.jsx("div",{className:"text-xs text-white/80",children:t("daysLeft")})]}),(0,c.jsxs)("div",{className:"bg-white/20 backdrop-blur rounded-xl p-3 text-center",children:[c.jsx("div",{className:"text-3xl font-bold",children:a.hours}),c.jsx("div",{className:"text-xs text-white/80",children:t("hoursLeft").split(" ")[0]})]}),(0,c.jsxs)("div",{className:"bg-white/20 backdrop-blur rounded-xl p-3 text-center",children:[c.jsx("div",{className:"text-3xl font-bold",children:a.minutes}),c.jsx("div",{className:"text-xs text-white/80",children:t("minutesLeft").split(" ")[0]})]}),(0,c.jsxs)("div",{className:"bg-white/20 backdrop-blur rounded-xl p-3 text-center",children:[c.jsx("div",{className:"text-3xl font-bold",children:a.seconds}),c.jsx("div",{className:"text-xs text-white/80",children:"sec"})]})]}),(0,c.jsxs)("p",{className:"text-center text-sm text-white/80 mt-4",children:[t("examDate"),": ",e.toLocaleDateString()]})]})}var g=a(12592),y=a(52443),x=a(71272);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let b=(0,x.Z)("Calculator",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]]),w=(0,x.Z)("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]),v=(0,x.Z)("Languages",[["path",{d:"m5 8 6 6",key:"1wu5hv"}],["path",{d:"m4 14 6-6 2-3",key:"1k1g8d"}],["path",{d:"M2 5h12",key:"or177f"}],["path",{d:"M7 2h1",key:"1t2jsx"}],["path",{d:"m22 22-5-10-5 10",key:"don7ne"}],["path",{d:"M14 18h6",key:"1m8k6r"}]]),j={"general-intelligence":y.Z,mathematics:b,"general-knowledge":w,english:v},N={"general-intelligence":"from-blue-500 to-blue-600",mathematics:"from-purple-500 to-purple-600","general-knowledge":"from-green-500 to-green-600",english:"from-orange-500 to-orange-600"};function k({subjects:e}){let t=(0,p.useTranslations)("dashboard");return(0,c.jsxs)("div",{className:"bg-white rounded-2xl p-6 shadow-sm",children:[c.jsx("div",{className:"flex items-center justify-between mb-6",children:c.jsx("h2",{className:"text-lg font-semibold text-gray-900",children:t("progress")})}),c.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",children:e.map(e=>{let a=j[e.code]||y.Z,r=N[e.code]||"from-gray-500 to-gray-600",s=e.completionPercentage>=100,n=e.completionPercentage>0&&e.completionPercentage<100;return(0,c.jsxs)("div",{className:"border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow",children:[(0,c.jsxs)("div",{className:"flex items-center gap-3 mb-4",children:[c.jsx("div",{className:(0,g.W)("p-2 rounded-lg bg-gradient-to-br",r),children:c.jsx(a,{className:"w-5 h-5 text-white"})}),(0,c.jsxs)("div",{className:"flex-1 min-w-0",children:[c.jsx("h3",{className:"font-medium text-gray-900 truncate",children:e.name}),(0,c.jsxs)("p",{className:"text-xs text-gray-500",children:[e.completedLessons,"/",e.totalLessons," ",t("complete").toLowerCase()]})]})]}),(0,c.jsxs)("div",{className:"mb-2",children:[(0,c.jsxs)("div",{className:"flex justify-between text-sm mb-1",children:[c.jsx("span",{className:"text-gray-600",children:s?t("complete"):n?t("inProgress"):t("pending")}),(0,c.jsxs)("span",{className:"font-semibold text-gray-900",children:[e.completionPercentage,"%"]})]}),c.jsx("div",{className:"h-2 bg-gray-100 rounded-full overflow-hidden",children:c.jsx("div",{className:(0,g.W)("h-full rounded-full transition-all duration-500",s?"bg-green-500":r),style:{width:`${Math.min(e.completionPercentage,100)}%`}})})]})]},e.id)})})]})}var _=a(90434),S=a(56235);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let C=(0,x.Z)("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);var E=a(771);let T={lesson:y.Z,test:S.Z,revision:C},D={lesson:"bg-blue-100 text-blue-600",test:"bg-purple-100 text-purple-600",revision:"bg-green-100 text-green-600"};function I({tasks:e,locale:t}){let a=(0,p.useTranslations)("dashboard");return(0,c.jsxs)("div",{className:"bg-white rounded-2xl p-6 shadow-sm",children:[(0,c.jsxs)("div",{className:"flex items-center justify-between mb-6",children:[c.jsx("h2",{className:"text-lg font-semibold text-gray-900",children:a("todayTasks")}),c.jsx(_.default,{href:`/${t}/study-plan/today`,className:"text-sm text-primary-600 hover:text-primary-700 font-medium",children:a("viewAll")})]}),0===e.length?(0,c.jsxs)("div",{className:"text-center py-8",children:[c.jsx("div",{className:"w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center",children:c.jsx(E.Z,{className:"w-8 h-8 text-gray-400"})}),c.jsx("p",{className:"text-gray-500",children:a("noTasksToday")})]}):c.jsx("div",{className:"space-y-3",children:e.map(e=>{let r=T[e.type];return(0,c.jsxs)("div",{className:(0,g.W)("flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm","completed"===e.status?"bg-gray-50 border-gray-100":"bg-white border-gray-100 hover:border-primary-200"),children:[c.jsx("div",{className:"flex-shrink-0",children:c.jsx("div",{className:(0,g.W)("p-2 rounded-lg",D[e.type]),children:c.jsx(r,{className:"w-5 h-5"})})}),(0,c.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,c.jsxs)("div",{className:"flex items-center gap-2 mb-1",children:[c.jsx("span",{className:(0,g.W)("px-2 py-0.5 rounded text-xs font-medium",D[e.type]),children:a(e.type)}),c.jsx("span",{className:"text-xs text-gray-500",children:e.subject})]}),c.jsx("h3",{className:(0,g.W)("font-medium truncate","completed"===e.status?"text-gray-500 line-through":"text-gray-900"),children:e.title}),c.jsx("p",{className:"text-sm text-gray-500 truncate",children:e.topic})]}),"completed"!==e.status&&c.jsx(_.default,{href:"lesson"===e.type?`/${t}/study/lesson/${e.id}`:"test"===e.type?`/${t}/tests/series/${e.id}/take`:`/${t}/study/revision/${e.id}`,className:"flex-shrink-0 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors",children:"in_progress"===e.status?a("inProgress"):a("practiceNow")})]},e.id)})})]})}var M=a(14701);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let A=(0,x.Z)("TrendingDown",[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]]);var P=a(47007);function L({weakAreas:e,locale:t}){let a=(0,p.useTranslations)("dashboard"),r=e=>e>=50?"text-yellow-600 bg-yellow-50":e>=40?"text-orange-600 bg-orange-50":"text-red-600 bg-red-50";return(0,c.jsxs)("div",{className:"bg-white rounded-2xl p-6 shadow-sm",children:[(0,c.jsxs)("div",{className:"flex items-center justify-between mb-6",children:[(0,c.jsxs)("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"p-2 bg-red-50 rounded-lg",children:c.jsx(M.Z,{className:"w-5 h-5 text-red-500"})}),c.jsx("h2",{className:"text-lg font-semibold text-gray-900",children:a("weakAreas")})]}),c.jsx(_.default,{href:`/${t}/analytics`,className:"text-sm text-primary-600 hover:text-primary-700 font-medium",children:a("viewAll")})]}),0===e.length?(0,c.jsxs)("div",{className:"text-center py-8",children:[c.jsx("div",{className:"w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center",children:c.jsx(A,{className:"w-8 h-8 text-green-500"})}),(0,c.jsxs)("p",{className:"text-gray-600 font-medium",children:["\uD83C\uDF89 ",a("noWeakAreas")]})]}):c.jsx("div",{className:"space-y-3",children:e.map(e=>(0,c.jsxs)("div",{className:"flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-sm transition-all",children:[c.jsx("div",{className:"flex-shrink-0",children:c.jsx("div",{className:(0,g.W)("w-14 h-14 rounded-full flex flex-col items-center justify-center",r(e.accuracy)),children:(0,c.jsxs)("span",{className:"text-lg font-bold",children:[e.accuracy,"%"]})})}),(0,c.jsxs)("div",{className:"flex-1 min-w-0",children:[c.jsx("h3",{className:"font-medium text-gray-900 truncate",children:e.topicName}),c.jsx("p",{className:"text-sm text-gray-500",children:e.subjectName}),(0,c.jsxs)("p",{className:"text-xs text-gray-400 mt-1",children:[e.correctAnswers,"/",e.totalQuestions," correct"]})]}),(0,c.jsxs)(_.default,{href:`/${t}/study/topic/${e.id}/practice`,className:"flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors",children:[a("practiceNow"),c.jsx(P.Z,{className:"w-4 h-4"})]})]},e.id))})]})}var B=a(74002);let O={lesson_completed:y.Z,test_completed:S.Z,streak_started:B.Z},Z={lesson_completed:"bg-blue-100 text-blue-600",test_completed:"bg-purple-100 text-purple-600",streak_started:"bg-orange-100 text-orange-600"};function R({activities:e}){let t=(0,p.useTranslations)("dashboard"),a=e=>{let a=Math.floor((new Date().getTime()-e.getTime())/864e5);return 0===a?t("today"):1===a?t("yesterday"):t("daysAgo",{days:a})},r=e=>{switch(e.type){case"lesson_completed":return t("completedLesson");case"test_completed":return t("completedTest");case"streak_started":return t("startedStreak",{days:e.metadata?.streakDays||1});default:return e.title}};return(0,c.jsxs)("div",{className:"bg-white rounded-2xl p-6 shadow-sm",children:[c.jsx("div",{className:"flex items-center justify-between mb-6",children:c.jsx("h2",{className:"text-lg font-semibold text-gray-900",children:t("recentActivity")})}),0===e.length?(0,c.jsxs)("div",{className:"text-center py-8",children:[c.jsx("div",{className:"w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center",children:c.jsx(m.Z,{className:"w-8 h-8 text-gray-400"})}),c.jsx("p",{className:"text-gray-500",children:t("noRecentActivity")})]}):c.jsx("div",{className:"space-y-4",children:e.map((t,s)=>{let n=O[t.type],i=Z[t.type];return(0,c.jsxs)("div",{className:"flex gap-4",children:[(0,c.jsxs)("div",{className:"flex flex-col items-center",children:[c.jsx("div",{className:(0,g.W)("p-2 rounded-lg",i),children:c.jsx(n,{className:"w-4 h-4"})}),s<e.length-1&&c.jsx("div",{className:"w-0.5 h-full min-h-[40px] bg-gray-100 my-1"})]}),c.jsx("div",{className:"flex-1 pb-4",children:(0,c.jsxs)("div",{className:"flex items-start justify-between",children:[(0,c.jsxs)("div",{children:[c.jsx("p",{className:(0,g.W)("font-medium text-gray-900",0===s&&"text-primary-700"),children:r(t)}),t.description&&c.jsx("p",{className:"text-sm text-gray-500 mt-0.5",children:t.description})]}),c.jsx("span",{className:"text-xs text-gray-400 whitespace-nowrap",children:a(t.timestamp)})]})})]},t.id)})})]})}function $({currentStreak:e,longestStreak:t,isActive:a}){let r=(0,p.useTranslations)("dashboard");return(0,c.jsxs)("div",{className:"bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white",children:[(0,c.jsxs)("div",{className:"flex items-center gap-3 mb-4",children:[(0,c.jsxs)("div",{className:(0,g.W)("relative",a&&"animate-pulse"),children:[c.jsx(B.Z,{className:(0,g.W)("w-8 h-8",a?"text-orange-300":"text-orange-400"),fill:a?"currentColor":"none"}),a&&e>=7&&c.jsx("div",{className:"absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-bounce"})]}),c.jsx("h2",{className:"text-lg font-semibold",children:r("streak")})]}),c.jsx("div",{className:"text-center mb-4",children:(0,c.jsxs)("div",{className:"flex items-baseline justify-center gap-1",children:[c.jsx("span",{className:"text-6xl font-bold",children:e}),c.jsx("span",{className:"text-xl text-orange-100",children:r("days")})]})}),(0,c.jsxs)("div",{className:"flex items-center justify-between text-sm",children:[(0,c.jsxs)("div",{className:"flex items-center gap-2",children:[c.jsx("span",{className:"text-orange-100",children:"Longest:"}),(0,c.jsxs)("span",{className:"font-semibold",children:[t," ",r("days")]})]}),a?(0,c.jsxs)("span",{className:"flex items-center gap-1 text-orange-100",children:[c.jsx("span",{className:"w-2 h-2 bg-green-400 rounded-full animate-pulse"}),r("streakFlame")]}):c.jsx("span",{className:"text-orange-200",children:r("streakLost")})]}),(0,c.jsxs)("div",{className:"mt-4 pt-4 border-t border-orange-400/30",children:[c.jsx("div",{className:"flex justify-between text-xs text-orange-100",children:[7,14,30,60,100].map(t=>(0,c.jsxs)("div",{className:(0,g.W)("flex flex-col items-center",e>=t&&"text-yellow-300"),children:[c.jsx("span",{className:"font-semibold",children:t}),c.jsx("span",{children:"\uD83D\uDD25"})]},t))}),e<100&&c.jsx("div",{className:"mt-2",children:c.jsx("div",{className:"h-1 bg-orange-400/30 rounded-full overflow-hidden",children:c.jsx("div",{className:"h-full bg-yellow-300 rounded-full transition-all duration-500",style:{width:`${e%100/100*100}%`}})})})]})]})}/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let H=(0,x.Z)("Crown",[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]]),W=(0,x.Z)("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);var F=a(15907);function q({planName:e,renewalDate:t,locale:a,isPremium:r}){let s=(0,p.useTranslations)("dashboard"),n=[s("unlimitedTests"),s("aiRecommendations"),s("physicalTraining"),s("prioritySupport")];return(0,c.jsxs)("div",{className:(0,g.W)("rounded-2xl p-6",r?"bg-gradient-to-br from-purple-600 to-purple-700 text-white":"bg-white shadow-sm border border-gray-100"),children:[(0,c.jsxs)("div",{className:"flex items-center gap-3 mb-4",children:[r?c.jsx(H,{className:"w-6 h-6 text-yellow-400"}):c.jsx(W,{className:"w-6 h-6 text-primary-600"}),c.jsx("h2",{className:"text-lg font-semibold",children:s(r?"premiumPlan":"currentPlan")})]}),(0,c.jsxs)("div",{className:"mb-4",children:[(0,c.jsxs)("div",{className:"flex items-baseline gap-2",children:[c.jsx("span",{className:"text-3xl font-bold",children:"free"===e?s("freePlan"):e.charAt(0).toUpperCase()+e.slice(1)}),"free"!==e&&(0,c.jsxs)("span",{className:(0,g.W)(r?"text-purple-200":"text-gray-500"),children:["/","quarterly"===e?"3mo":"yearly"===e?"year":"mo"]})]}),t&&(0,c.jsxs)("p",{className:(0,g.W)("text-sm mt-1",r?"text-purple-200":"text-gray-500"),children:[s("renewalDate"),": ",t.toLocaleDateString("hi"===a?"hi-IN":"en-US",{day:"numeric",month:"short",year:"numeric"})]})]}),r?c.jsx("div",{className:"space-y-2 mb-4",children:n.map((e,t)=>(0,c.jsxs)("div",{className:"flex items-center gap-2 text-sm",children:[c.jsx(F.Z,{className:"w-4 h-4 text-green-400"}),c.jsx("span",{children:e})]},t))}):(0,c.jsxs)("div",{className:"mb-4",children:[c.jsx("p",{className:(0,g.W)("text-sm mb-3",r?"text-purple-200":"text-gray-600"),children:"Unlock premium features:"}),c.jsx("div",{className:"grid grid-cols-2 gap-2 text-xs",children:n.map((e,t)=>(0,c.jsxs)("div",{className:"flex items-center gap-1 text-gray-500",children:[c.jsx("span",{children:"✨"}),c.jsx("span",{children:e})]},t))})]}),!r&&c.jsx(_.default,{href:`/${a}/pricing`,className:"block w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-300",children:s("upgradeToPremium")})]})}/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let K=(0,x.Z)("Wifi",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0",key:"dnpr2z"}],["path",{d:"M5 12.859a10 10 0 0 1 14 0",key:"1x1e6c"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}]]),V=(0,x.Z)("WifiOff",[["path",{d:"M12 20h.01",key:"zekei9"}],["path",{d:"M8.5 16.429a5 5 0 0 1 7 0",key:"1bycff"}],["path",{d:"M5 12.859a10 10 0 0 1 5.17-2.69",key:"1dl1wf"}],["path",{d:"M19 12.859a10 10 0 0 0-2.007-1.523",key:"4k23kn"}],["path",{d:"M2 8.82a15 15 0 0 1 4.177-2.643",key:"1grhjp"}],["path",{d:"M22 8.82a15 15 0 0 0-11.288-3.764",key:"z3jwby"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);var U=a(23861);function z(){let e=(0,p.useTranslations)("dashboard"),[t,a]=(0,d.useState)(!0),[r,s]=(0,d.useState)(!1),[n,i]=(0,d.useState)(!1);return!r||n?null:(0,c.jsxs)("div",{className:(0,g.W)("fixed top-0 left-0 right-0 z-[100] px-4 py-3 flex items-center justify-between transition-colors duration-300",t?"bg-green-500 text-white":"bg-red-500 text-white"),children:[c.jsx("div",{className:"flex items-center gap-3",children:t?(0,c.jsxs)(c.Fragment,{children:[c.jsx(K,{className:"w-5 h-5"}),c.jsx("span",{className:"font-medium",children:e("backOnline")})]}):(0,c.jsxs)(c.Fragment,{children:[c.jsx(V,{className:"w-5 h-5"}),c.jsx("span",{className:"font-medium",children:e("offlineMessage")})]})}),c.jsx("button",{onClick:()=>i(!0),className:"p-1 hover:bg-white/20 rounded transition-colors","aria-label":"Dismiss",children:c.jsx(U.Z,{className:"w-4 h-4"})})]})}/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let G=(0,x.Z)("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);var J=a(3726),X=a(95383);let Q=()=>void 0,Y=function(e){let t=[],a=0;for(let r=0;r<e.length;r++){let s=e.charCodeAt(r);s<128?t[a++]=s:(s<2048?t[a++]=s>>6|192:((64512&s)==55296&&r+1<e.length&&(64512&e.charCodeAt(r+1))==56320?(s=65536+((1023&s)<<10)+(1023&e.charCodeAt(++r)),t[a++]=s>>18|240,t[a++]=s>>12&63|128):t[a++]=s>>12|224,t[a++]=s>>6&63|128),t[a++]=63&s|128)}return t},ee=function(e){let t=[],a=0,r=0;for(;a<e.length;){let s=e[a++];if(s<128)t[r++]=String.fromCharCode(s);else if(s>191&&s<224){let n=e[a++];t[r++]=String.fromCharCode((31&s)<<6|63&n)}else if(s>239&&s<365){let n=((7&s)<<18|(63&e[a++])<<12|(63&e[a++])<<6|63&e[a++])-65536;t[r++]=String.fromCharCode(55296+(n>>10)),t[r++]=String.fromCharCode(56320+(1023&n))}else{let n=e[a++],i=e[a++];t[r++]=String.fromCharCode((15&s)<<12|(63&n)<<6|63&i)}}return t.join("")},et={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();let a=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let t=0;t<e.length;t+=3){let s=e[t],n=t+1<e.length,i=n?e[t+1]:0,o=t+2<e.length,l=o?e[t+2]:0,c=s>>2,d=(3&s)<<4|i>>4,p=(15&i)<<2|l>>6,h=63&l;o||(h=64,n||(p=64)),r.push(a[c],a[d],a[p],a[h])}return r.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(Y(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):ee(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();let a=t?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let t=0;t<e.length;){let s=a[e.charAt(t++)],n=t<e.length?a[e.charAt(t)]:0,i=++t<e.length?a[e.charAt(t)]:64,o=++t<e.length?a[e.charAt(t)]:64;if(++t,null==s||null==n||null==i||null==o)throw new ea;let l=s<<2|n>>4;if(r.push(l),64!==i){let e=n<<4&240|i>>2;if(r.push(e),64!==o){let e=i<<6&192|o;r.push(e)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}};class ea extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}let er=function(e){let t=Y(e);return et.encodeByteArray(t,!0)},es=function(e){return er(e).replace(/\./g,"")},en=function(e){try{return et.decodeString(e,!0)}catch(e){console.error("base64Decode failed: ",e)}return null},ei=()=>/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw Error("Unable to locate global object.")})().__FIREBASE_DEFAULTS__,eo=()=>{if("undefined"==typeof process||void 0===process.env)return;let e=process.env.__FIREBASE_DEFAULTS__;if(e)return JSON.parse(e)},el=()=>{let e;if("undefined"==typeof document)return;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(e){return}let t=e&&en(e[1]);return t&&JSON.parse(t)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ec{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,a)=>{t?this.reject(t):this.resolve(a),"function"==typeof e&&(this.promise.catch(()=>{}),1===e.length?e(t):e(t,a))}}}class ed extends Error{constructor(e,t,a){super(t),this.code=e,this.customData=a,this.name="FirebaseError",Object.setPrototypeOf(this,ed.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ep.prototype.create)}}class ep{constructor(e,t,a){this.service=e,this.serviceName=t,this.errors=a}create(e,...t){let a=t[0]||{},r=`${this.service}/${e}`,s=this.errors[e],n=s?s.replace(eh,(e,t)=>{let r=a[t];return null!=r?String(r):`<${t}?>`}):"Error",i=`${this.serviceName}: ${n} (${r}).`;return new ed(r,i,a)}}let eh=/\{\$([^}]+)}/g;class eu{constructor(e,t,a){this.name=e,this.instanceFactory=t,this.type=a,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let em="[DEFAULT]",ef=[];!function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"}(i||(i={}));let eg={debug:i.DEBUG,verbose:i.VERBOSE,info:i.INFO,warn:i.WARN,error:i.ERROR,silent:i.SILENT},ey=i.INFO,ex={[i.DEBUG]:"log",[i.VERBOSE]:"log",[i.INFO]:"info",[i.WARN]:"warn",[i.ERROR]:"error"},eb=(e,t,...a)=>{if(t<e.logLevel)return;let r=new Date().toISOString(),s=ex[t];if(s)console[s](`[${r}]  ${e.name}:`,...a);else throw Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class ew{constructor(e){this.name=e,this._logLevel=ey,this._logHandler=eb,this._userLogHandler=null,ef.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in i))throw TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel="string"==typeof e?eg[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if("function"!=typeof e)throw TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,i.DEBUG,...e),this._logHandler(this,i.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,i.VERBOSE,...e),this._logHandler(this,i.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,i.INFO,...e),this._logHandler(this,i.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,i.WARN,...e),this._logHandler(this,i.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,i.ERROR,...e),this._logHandler(this,i.ERROR,...e)}}let ev=(e,t)=>t.some(t=>e instanceof t),ej=new WeakMap,eN=new WeakMap,ek=new WeakMap,e_=new WeakMap,eS=new WeakMap,eC={get(e,t,a){if(e instanceof IDBTransaction){if("done"===t)return eN.get(e);if("objectStoreNames"===t)return e.objectStoreNames||ek.get(e);if("store"===t)return a.objectStoreNames[1]?void 0:a.objectStore(a.objectStoreNames[0])}return eE(e[t])},set:(e,t,a)=>(e[t]=a,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function eE(e){var t;if(e instanceof IDBRequest)return function(e){let t=new Promise((t,a)=>{let r=()=>{e.removeEventListener("success",s),e.removeEventListener("error",n)},s=()=>{t(eE(e.result)),r()},n=()=>{a(e.error),r()};e.addEventListener("success",s),e.addEventListener("error",n)});return t.then(t=>{t instanceof IDBCursor&&ej.set(t,e)}).catch(()=>{}),eS.set(t,e),t}(e);if(e_.has(e))return e_.get(e);let a="function"==typeof(t=e)?t!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(s||(s=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(t)?function(...e){return t.apply(eT(this),e),eE(ej.get(this))}:function(...e){return eE(t.apply(eT(this),e))}:function(e,...a){let r=t.call(eT(this),e,...a);return ek.set(r,e.sort?e.sort():[e]),eE(r)}:(t instanceof IDBTransaction&&function(e){if(eN.has(e))return;let t=new Promise((t,a)=>{let r=()=>{e.removeEventListener("complete",s),e.removeEventListener("error",n),e.removeEventListener("abort",n)},s=()=>{t(),r()},n=()=>{a(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",s),e.addEventListener("error",n),e.addEventListener("abort",n)});eN.set(e,t)}(t),ev(t,r||(r=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])))?new Proxy(t,eC):t;return a!==e&&(e_.set(e,a),eS.set(a,e)),a}let eT=e=>eS.get(e);function eD(e,t,{blocked:a,upgrade:r,blocking:s,terminated:n}={}){let i=indexedDB.open(e,t),o=eE(i);return r&&i.addEventListener("upgradeneeded",e=>{r(eE(i.result),e.oldVersion,e.newVersion,eE(i.transaction),e)}),a&&i.addEventListener("blocked",e=>a(e.oldVersion,e.newVersion,e)),o.then(e=>{n&&e.addEventListener("close",()=>n()),s&&e.addEventListener("versionchange",e=>s(e.oldVersion,e.newVersion,e))}).catch(()=>{}),o}function eI(e,{blocked:t}={}){let a=indexedDB.deleteDatabase(e);return t&&a.addEventListener("blocked",e=>t(e.oldVersion,e)),eE(a).then(()=>void 0)}let eM=["get","getKey","getAll","getAllKeys","count"],eA=["put","add","delete","clear"],eP=new Map;function eL(e,t){if(!(e instanceof IDBDatabase&&!(t in e)&&"string"==typeof t))return;if(eP.get(t))return eP.get(t);let a=t.replace(/FromIndex$/,""),r=t!==a,s=eA.includes(a);if(!(a in(r?IDBIndex:IDBObjectStore).prototype)||!(s||eM.includes(a)))return;let n=async function(e,...t){let n=this.transaction(e,s?"readwrite":"readonly"),i=n.store;return r&&(i=i.index(t.shift())),(await Promise.all([i[a](...t),s&&n.done]))[0]};return eP.set(t,n),n}eC={...n=eC,get:(e,t,a)=>eL(e,t)||n.get(e,t,a),has:(e,t)=>!!eL(e,t)||n.has(e,t)};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eB{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(!function(e){let t=e.getComponent();return t?.type==="VERSION"}(e))return null;{let t=e.getImmediate();return`${t.library}/${t.version}`}}).filter(e=>e).join(" ")}}let eO="@firebase/app",eZ="0.14.10",eR=new ew("@firebase/app"),e$={[eO]:"fire-core","@firebase/app-compat":"fire-core-compat","@firebase/analytics":"fire-analytics","@firebase/analytics-compat":"fire-analytics-compat","@firebase/app-check":"fire-app-check","@firebase/app-check-compat":"fire-app-check-compat","@firebase/auth":"fire-auth","@firebase/auth-compat":"fire-auth-compat","@firebase/database":"fire-rtdb","@firebase/data-connect":"fire-data-connect","@firebase/database-compat":"fire-rtdb-compat","@firebase/functions":"fire-fn","@firebase/functions-compat":"fire-fn-compat","@firebase/installations":"fire-iid","@firebase/installations-compat":"fire-iid-compat","@firebase/messaging":"fire-fcm","@firebase/messaging-compat":"fire-fcm-compat","@firebase/performance":"fire-perf","@firebase/performance-compat":"fire-perf-compat","@firebase/remote-config":"fire-rc","@firebase/remote-config-compat":"fire-rc-compat","@firebase/storage":"fire-gcs","@firebase/storage-compat":"fire-gcs-compat","@firebase/firestore":"fire-fst","@firebase/firestore-compat":"fire-fst-compat","@firebase/ai":"fire-vertex","fire-js":"fire-js",firebase:"fire-js-all"},eH=new Map,eW=new Map,eF=new Map;function eq(e,t){try{e.container.addComponent(t)}catch(a){eR.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,a)}}function eK(e){let t=e.name;if(eF.has(t))return eR.debug(`There were multiple attempts to register component ${t}.`),!1;for(let a of(eF.set(t,e),eH.values()))eq(a,e);for(let t of eW.values())eq(t,e);return!0}function eV(e,t){let a=e.container.getProvider("heartbeat").getImmediate({optional:!0});return a&&a.triggerHeartbeat(),e.container.getProvider(t)}let eU=new ep("app","Firebase",{"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."});function ez(e,t,a){let r=e$[e]??e;a&&(r+=`-${a}`);let s=r.match(/\s|\//),n=t.match(/\s|\//);if(s||n){let e=[`Unable to register library "${r}" with version "${t}":`];s&&e.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&n&&e.push("and"),n&&e.push(`version name "${t}" contains illegal characters (whitespace or "/")`),eR.warn(e.join(" "));return}eK(new eu(`${r}-version`,()=>({library:r,version:t}),"VERSION"))}let eG="firebase-heartbeat-store",eJ=null;function eX(){return eJ||(eJ=eD("firebase-heartbeat-database",1,{upgrade:(e,t)=>{if(0===t)try{e.createObjectStore(eG)}catch(e){console.warn(e)}}}).catch(e=>{throw eU.create("idb-open",{originalErrorMessage:e.message})})),eJ}async function eQ(e){try{let t=(await eX()).transaction(eG),a=await t.objectStore(eG).get(e0(e));return await t.done,a}catch(e){if(e instanceof ed)eR.warn(e.message);else{let t=eU.create("idb-get",{originalErrorMessage:e?.message});eR.warn(t.message)}}}async function eY(e,t){try{let a=(await eX()).transaction(eG,"readwrite"),r=a.objectStore(eG);await r.put(t,e0(e)),await a.done}catch(e){if(e instanceof ed)eR.warn(e.message);else{let t=eU.create("idb-set",{originalErrorMessage:e?.message});eR.warn(t.message)}}}function e0(e){return`${e.name}!${e.options.appId}`}class e1{constructor(e){this.container=e,this._heartbeatsCache=null;let t=this.container.getProvider("app").getImmediate();this._storage=new e5(t),this._heartbeatsCachePromise=this._storage.read().then(e=>(this._heartbeatsCache=e,e))}async triggerHeartbeat(){try{let e=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),t=e2();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===t||this._heartbeatsCache.heartbeats.some(e=>e.date===t))return;if(this._heartbeatsCache.heartbeats.push({date:t,agent:e}),this._heartbeatsCache.heartbeats.length>30){let e=function(e){if(0===e.length)return -1;let t=0,a=e[0].date;for(let r=1;r<e.length;r++)e[r].date<a&&(a=e[r].date,t=r);return t}(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(e,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){eR.warn(e)}}async getHeartbeatsHeader(){try{if(null===this._heartbeatsCache&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||0===this._heartbeatsCache.heartbeats.length)return"";let e=e2(),{heartbeatsToSend:t,unsentEntries:a}=function(e,t=1024){let a=[],r=e.slice();for(let s of e){let e=a.find(e=>e.agent===s.agent);if(e){if(e.dates.push(s.date),e4(a)>t){e.dates.pop();break}}else if(a.push({agent:s.agent,dates:[s.date]}),e4(a)>t){a.pop();break}r=r.slice(1)}return{heartbeatsToSend:a,unsentEntries:r}}(this._heartbeatsCache.heartbeats),r=es(JSON.stringify({version:2,heartbeats:t}));return this._heartbeatsCache.lastSentHeartbeatDate=e,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return eR.warn(e),""}}}function e2(){return new Date().toISOString().substring(0,10)}class e5{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return!!function(){try{return"object"==typeof indexedDB}catch(e){return!1}}()&&new Promise((e,t)=>{try{let a=!0,r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),a||self.indexedDB.deleteDatabase(r),e(!0)},s.onupgradeneeded=()=>{a=!1},s.onerror=()=>{t(s.error?.message||"")}}catch(e){t(e)}}).then(()=>!0).catch(()=>!1)}async read(){if(!await this._canUseIndexedDBPromise)return{heartbeats:[]};{let e=await eQ(this.app);return e?.heartbeats?e:{heartbeats:[]}}}async overwrite(e){if(await this._canUseIndexedDBPromise){let t=await this.read();return eY(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??t.lastSentHeartbeatDate,heartbeats:e.heartbeats})}}async add(e){if(await this._canUseIndexedDBPromise){let t=await this.read();return eY(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??t.lastSentHeartbeatDate,heartbeats:[...t.heartbeats,...e.heartbeats]})}}}function e4(e){return es(JSON.stringify({version:2,heartbeats:e})).length}eK(new eu("platform-logger",e=>new eB(e),"PRIVATE")),eK(new eu("heartbeat",e=>new e1(e),"PRIVATE")),ez(eO,eZ,""),ez(eO,eZ,"esm2020"),ez("fire-js",""),/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ez("firebase","12.11.0","app");let e6="@firebase/installations",e3="0.6.21",e7=`w:${e3}`,e8="FIS_v2",e9=new ep("installations","Installations",{"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."});function te(e){return e instanceof ed&&e.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tt({projectId:e}){return`https://firebaseinstallations.googleapis.com/v1/projects/${e}/installations`}function ta(e){return{token:e.token,requestStatus:2,expiresIn:Number(e.expiresIn.replace("s","000")),creationTime:Date.now()}}async function tr(e,t){let a=(await t.json()).error;return e9.create("request-failed",{requestName:e,serverCode:a.code,serverMessage:a.message,serverStatus:a.status})}function ts({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}async function tn(e){let t=await e();return t.status>=500&&t.status<600?e():t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ti({appConfig:e,heartbeatServiceProvider:t},{fid:a}){let r=tt(e),s=ts(e),n=t.getImmediate({optional:!0});if(n){let e=await n.getHeartbeatsHeader();e&&s.append("x-firebase-client",e)}let i={method:"POST",headers:s,body:JSON.stringify({fid:a,authVersion:e8,appId:e.appId,sdkVersion:e7})},o=await tn(()=>fetch(r,i));if(o.ok){let e=await o.json();return{fid:e.fid||a,registrationStatus:2,refreshToken:e.refreshToken,authToken:ta(e.authToken)}}throw await tr("Create Installation",o)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function to(e){return new Promise(t=>{setTimeout(t,e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let tl=/^[cdef][\w-]{21}$/;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tc(e){return`${e.appName}!${e.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let td=new Map;function tp(e,t){let a=tc(e);th(a,t),function(e,t){let a=(!tu&&"BroadcastChannel"in self&&((tu=new BroadcastChannel("[Firebase] FID Change")).onmessage=e=>{th(e.data.key,e.data.fid)}),tu);a&&a.postMessage({key:e,fid:t}),0===td.size&&tu&&(tu.close(),tu=null)}(a,t)}function th(e,t){let a=td.get(e);if(a)for(let e of a)e(t)}let tu=null,tm="firebase-installations-store",tf=null;function tg(){return tf||(tf=eD("firebase-installations-database",1,{upgrade:(e,t)=>{0===t&&e.createObjectStore(tm)}})),tf}async function ty(e,t){let a=tc(e),r=(await tg()).transaction(tm,"readwrite"),s=r.objectStore(tm),n=await s.get(a);return await s.put(t,a),await r.done,n&&n.fid===t.fid||tp(e,t.fid),t}async function tx(e){let t=tc(e),a=(await tg()).transaction(tm,"readwrite");await a.objectStore(tm).delete(t),await a.done}async function tb(e,t){let a=tc(e),r=(await tg()).transaction(tm,"readwrite"),s=r.objectStore(tm),n=await s.get(a),i=t(n);return void 0===i?await s.delete(a):await s.put(i,a),await r.done,i&&(!n||n.fid!==i.fid)&&tp(e,i.fid),i}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tw(e){let t;let a=await tb(e.appConfig,a=>{let r=function(e,t){if(0===t.registrationStatus){if(!navigator.onLine)return{installationEntry:t,registrationPromise:Promise.reject(e9.create("app-offline"))};let a={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},r=tv(e,a);return{installationEntry:a,registrationPromise:r}}return 1===t.registrationStatus?{installationEntry:t,registrationPromise:tj(e)}:{installationEntry:t}}(e,tk(a||{fid:function(){try{let e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;let t=btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_").substr(0,22);return tl.test(t)?t:""}catch{return""}}(),registrationStatus:0}));return t=r.registrationPromise,r.installationEntry});return""===a.fid?{installationEntry:await t}:{installationEntry:a,registrationPromise:t}}async function tv(e,t){try{let a=await ti(e,t);return ty(e.appConfig,a)}catch(a){throw te(a)&&409===a.customData.serverCode?await tx(e.appConfig):await ty(e.appConfig,{fid:t.fid,registrationStatus:0}),a}}async function tj(e){let t=await tN(e.appConfig);for(;1===t.registrationStatus;)await to(100),t=await tN(e.appConfig);if(0===t.registrationStatus){let{installationEntry:t,registrationPromise:a}=await tw(e);return a||t}return t}function tN(e){return tb(e,e=>{if(!e)throw e9.create("installation-not-found");return tk(e)})}function tk(e){return 1===e.registrationStatus&&e.registrationTime+1e4<Date.now()?{fid:e.fid,registrationStatus:0}:e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function t_({appConfig:e,heartbeatServiceProvider:t},a){let r=function(e,{fid:t}){return`${tt(e)}/${t}/authTokens:generate`}(e,a),s=function(e,{refreshToken:t}){let a=ts(e);return a.append("Authorization",`${e8} ${t}`),a}(e,a),n=t.getImmediate({optional:!0});if(n){let e=await n.getHeartbeatsHeader();e&&s.append("x-firebase-client",e)}let i={method:"POST",headers:s,body:JSON.stringify({installation:{sdkVersion:e7,appId:e.appId}})},o=await tn(()=>fetch(r,i));if(o.ok)return ta(await o.json());throw await tr("Generate Auth Token",o)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tS(e,t=!1){let a;let r=await tb(e.appConfig,r=>{var s;if(!tD(r))throw e9.create("not-registered");let n=r.authToken;if(!t&&2===(s=n).requestStatus&&!function(e){let t=Date.now();return t<e.creationTime||e.creationTime+e.expiresIn<t+36e5}(s))return r;if(1===n.requestStatus)return a=tC(e,t),r;{if(!navigator.onLine)throw e9.create("app-offline");let t=function(e){let t={requestStatus:1,requestTime:Date.now()};return{...e,authToken:t}}(r);return a=tT(e,t),t}});return a?await a:r.authToken}async function tC(e,t){let a=await tE(e.appConfig);for(;1===a.authToken.requestStatus;)await to(100),a=await tE(e.appConfig);let r=a.authToken;return 0===r.requestStatus?tS(e,t):r}function tE(e){return tb(e,e=>{var t;if(!tD(e))throw e9.create("not-registered");return 1===(t=e.authToken).requestStatus&&t.requestTime+1e4<Date.now()?{...e,authToken:{requestStatus:0}}:e})}async function tT(e,t){try{let a=await t_(e,t),r={...t,authToken:a};return await ty(e.appConfig,r),a}catch(a){if(te(a)&&(401===a.customData.serverCode||404===a.customData.serverCode))await tx(e.appConfig);else{let a={...t,authToken:{requestStatus:0}};await ty(e.appConfig,a)}throw a}}function tD(e){return void 0!==e&&2===e.registrationStatus}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tI(e){let{installationEntry:t,registrationPromise:a}=await tw(e);return a?a.catch(console.error):tS(e).catch(console.error),t.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tM(e,t=!1){return await tA(e),(await tS(e,t)).token}async function tA(e){let{registrationPromise:t}=await tw(e);t&&await t}function tP(e){return e9.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let tL="installations";eK(new eu(tL,e=>{let t=e.getProvider("app").getImmediate(),a=/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){if(!e||!e.options)throw tP("App Configuration");if(!e.name)throw tP("App Name");for(let t of["projectId","apiKey","appId"])if(!e.options[t])throw tP(t);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}(t),r=eV(t,"heartbeat");return{app:t,appConfig:a,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},"PUBLIC")),eK(new eu("installations-internal",e=>{let t=eV(e.getProvider("app").getImmediate(),tL).getImmediate();return{getId:()=>tI(t),getToken:e=>tM(t,e)}},"PRIVATE")),ez(e6,e3),ez(e6,e3,"esm2020");let tB="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",tO="google.c.a.c_id";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tZ(e){return btoa(String.fromCharCode(...new Uint8Array(e))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}(function(e){e[e.DATA_MESSAGE=1]="DATA_MESSAGE",e[e.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(o||(o={})),function(e){e.PUSH_RECEIVED="push-received",e.NOTIFICATION_CLICKED="notification-clicked"}(l||(l={}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let tR="fcm_token_details_db",t$="fcm_token_object_Store";async function tH(e){if("databases"in indexedDB&&!(await indexedDB.databases()).map(e=>e.name).includes(tR))return null;let t=null;return(await eD(tR,5,{upgrade:async(a,r,s,n)=>{if(r<2||!a.objectStoreNames.contains(t$))return;let i=n.objectStore(t$),o=await i.index("fcmSenderId").get(e);if(await i.clear(),o){if(2===r){if(!o.auth||!o.p256dh||!o.endpoint)return;t={token:o.fcmToken,createTime:o.createTime??Date.now(),subscriptionOptions:{auth:o.auth,p256dh:o.p256dh,endpoint:o.endpoint,swScope:o.swScope,vapidKey:"string"==typeof o.vapidKey?o.vapidKey:tZ(o.vapidKey)}}}else 3===r?t={token:o.fcmToken,createTime:o.createTime,subscriptionOptions:{auth:tZ(o.auth),p256dh:tZ(o.p256dh),endpoint:o.endpoint,swScope:o.swScope,vapidKey:tZ(o.vapidKey)}}:4===r&&(t={token:o.fcmToken,createTime:o.createTime,subscriptionOptions:{auth:tZ(o.auth),p256dh:tZ(o.p256dh),endpoint:o.endpoint,swScope:o.swScope,vapidKey:tZ(o.vapidKey)}})}}})).close(),await eI(tR),await eI("fcm_vapid_details_db"),await eI("undefined"),!function(e){if(!e||!e.subscriptionOptions)return!1;let{subscriptionOptions:t}=e;return"number"==typeof e.createTime&&e.createTime>0&&"string"==typeof e.token&&e.token.length>0&&"string"==typeof t.auth&&t.auth.length>0&&"string"==typeof t.p256dh&&t.p256dh.length>0&&"string"==typeof t.endpoint&&t.endpoint.length>0&&"string"==typeof t.swScope&&t.swScope.length>0&&"string"==typeof t.vapidKey&&t.vapidKey.length>0}(t)?null:t}let tW="firebase-messaging-store",tF=null;function tq(){return tF||(tF=eD("firebase-messaging-database",1,{upgrade:(e,t)=>{0===t&&e.createObjectStore(tW)}})),tF}async function tK(e){let t=function({appConfig:e}){return e.appId}(e),a=await tq(),r=await a.transaction(tW).objectStore(tW).get(t);if(r)return r;{let t=await tH(e.appConfig.senderId);if(t)return await tV(e,t),t}}async function tV(e,t){let a=function({appConfig:e}){return e.appId}(e),r=(await tq()).transaction(tW,"readwrite");return await r.objectStore(tW).put(t,a),await r.done,t}async function tU(e){let t=function({appConfig:e}){return e.appId}(e),a=(await tq()).transaction(tW,"readwrite");await a.objectStore(tW).delete(t),await a.done}let tz=new ep("messaging","Messaging",{"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."});/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tG(e,t){let a;let r={method:"POST",headers:await tY(e),body:JSON.stringify(t0(t))};try{let t=await fetch(tQ(e.appConfig),r);a=await t.json()}catch(e){throw tz.create("token-subscribe-failed",{errorInfo:e?.toString()})}if(a.error){let e=a.error.message;throw tz.create("token-subscribe-failed",{errorInfo:e})}if(!a.token)throw tz.create("token-subscribe-no-token");return a.token}async function tJ(e,t){let a;let r={method:"PATCH",headers:await tY(e),body:JSON.stringify(t0(t.subscriptionOptions))};try{let s=await fetch(`${tQ(e.appConfig)}/${t.token}`,r);a=await s.json()}catch(e){throw tz.create("token-update-failed",{errorInfo:e?.toString()})}if(a.error){let e=a.error.message;throw tz.create("token-update-failed",{errorInfo:e})}if(!a.token)throw tz.create("token-update-no-token");return a.token}async function tX(e,t){let a=await tY(e);try{let r=await fetch(`${tQ(e.appConfig)}/${t}`,{method:"DELETE",headers:a}),s=await r.json();if(s.error){let e=s.error.message;throw tz.create("token-unsubscribe-failed",{errorInfo:e})}}catch(e){throw tz.create("token-unsubscribe-failed",{errorInfo:e?.toString()})}}function tQ({projectId:e}){return`https://fcmregistrations.googleapis.com/v1/projects/${e}/registrations`}async function tY({appConfig:e,installations:t}){let a=await t.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e.apiKey,"x-goog-firebase-installations-auth":`FIS ${a}`})}function t0({p256dh:e,auth:t,endpoint:a,vapidKey:r}){let s={web:{endpoint:a,auth:t,p256dh:e}};return r!==tB&&(s.web.applicationPubKey=r),s}async function t1(e){let t=await t4(e.swRegistration,e.vapidKey),a={vapidKey:e.vapidKey,swScope:e.swRegistration.scope,endpoint:t.endpoint,auth:tZ(t.getKey("auth")),p256dh:tZ(t.getKey("p256dh"))},r=await tK(e.firebaseDependencies);if(!r)return t5(e.firebaseDependencies,a);if(function(e,t){let a=t.vapidKey===e.vapidKey,r=t.endpoint===e.endpoint,s=t.auth===e.auth,n=t.p256dh===e.p256dh;return a&&r&&s&&n}(r.subscriptionOptions,a))return Date.now()>=r.createTime+6048e5?t2(e,{token:r.token,createTime:Date.now(),subscriptionOptions:a}):r.token;try{await tX(e.firebaseDependencies,r.token)}catch(e){console.warn(e)}return t5(e.firebaseDependencies,a)}async function t2(e,t){try{let a=await tJ(e.firebaseDependencies,t),r={...t,token:a,createTime:Date.now()};return await tV(e.firebaseDependencies,r),a}catch(e){throw e}}async function t5(e,t){let a={token:await tG(e,t),createTime:Date.now(),subscriptionOptions:t};return await tV(e,a),a.token}async function t4(e,t){return await e.pushManager.getSubscription()||e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:function(e){let t="=".repeat((4-e.length%4)%4),a=atob((e+t).replace(/\-/g,"+").replace(/_/g,"/")),r=new Uint8Array(a.length);for(let e=0;e<a.length;++e)r[e]=a.charCodeAt(e);return r}(t)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function t6(e){let t={from:e.from,collapseKey:e.collapse_key,messageId:e.fcmMessageId};return function(e,t){if(!t.notification)return;e.notification={};let a=t.notification.title;a&&(e.notification.title=a);let r=t.notification.body;r&&(e.notification.body=r);let s=t.notification.image;s&&(e.notification.image=s);let n=t.notification.icon;n&&(e.notification.icon=n)}(t,e),e.data&&(t.data=e.data),function(e,t){if(!t.fcmOptions&&!t.notification?.click_action)return;e.fcmOptions={};let a=t.fcmOptions?.link??t.notification?.click_action;a&&(e.fcmOptions.link=a);let r=t.fcmOptions?.analytics_label;r&&(e.fcmOptions.analyticsLabel=r)}(t,e),t}function t3(e){return tz.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(function(e,t){let a=[];for(let r=0;r<e.length;r++)a.push(e.charAt(r)),r<t.length&&a.push(t.charAt(r));a.join("")})("AzSCbw63g1R0nCw85jG8","Iaya3yLKwmgvh7cF0q4");/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class t7{constructor(e,t,a){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;let r=/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){if(!e||!e.options)throw t3("App Configuration Object");if(!e.name)throw t3("App Name");let{options:t}=e;for(let e of["projectId","apiKey","appId","messagingSenderId"])if(!t[e])throw t3(e);return{appName:e.name,projectId:t.projectId,apiKey:t.apiKey,appId:t.appId,senderId:t.messagingSenderId}}(e);this.firebaseDependencies={app:e,appConfig:r,installations:t,analyticsProvider:a}}_delete(){return Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function t8(e){try{e.swRegistration=await navigator.serviceWorker.register("/firebase-messaging-sw.js",{scope:"/firebase-cloud-messaging-push-scope"}),e.swRegistration.update().catch(()=>{}),await t9(e.swRegistration)}catch(e){throw tz.create("failed-service-worker-registration",{browserErrorMessage:e?.message})}}async function t9(e){return new Promise((t,a)=>{let r=setTimeout(()=>a(Error("Service worker not registered after 10000 ms")),1e4),s=e.installing||e.waiting;e.active?(clearTimeout(r),t()):s?s.onstatechange=e=>{e.target?.state==="activated"&&(s.onstatechange=null,clearTimeout(r),t())}:(clearTimeout(r),a(Error("No incoming service worker found.")))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ae(e,t){if(t||e.swRegistration||await t8(e),t||!e.swRegistration){if(!(t instanceof ServiceWorkerRegistration))throw tz.create("invalid-sw-registration");e.swRegistration=t}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function at(e,t){t?e.vapidKey=t:e.vapidKey||(e.vapidKey=tB)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function aa(e,t){if(!navigator)throw tz.create("only-available-in-window");if("default"===Notification.permission&&await Notification.requestPermission(),"granted"!==Notification.permission)throw tz.create("permission-blocked");return await at(e,t?.vapidKey),await ae(e,t?.serviceWorkerRegistration),t1(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ar(e,t,a){let r=function(e){switch(e){case l.NOTIFICATION_CLICKED:return"notification_open";case l.PUSH_RECEIVED:return"notification_foreground";default:throw Error()}}(t);(await e.firebaseDependencies.analyticsProvider.get()).logEvent(r,{message_id:a[tO],message_name:a["google.c.a.c_l"],message_time:a["google.c.a.ts"],message_device_time:Math.floor(Date.now()/1e3)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function as(e,t){let a=t.data;if(!a.isFirebaseMessaging)return;e.onMessageHandler&&a.messageType===l.PUSH_RECEIVED&&("function"==typeof e.onMessageHandler?e.onMessageHandler(t6(a)):e.onMessageHandler.next(t6(a)));let r=a.data;"object"==typeof r&&r&&tO in r&&"1"===r["google.c.a.e"]&&await ar(e,a.messageType,r)}let an="@firebase/messaging",ai="0.12.25";async function ao(){return"unsupported"}async function al(){return console.error("Firebase not initialized"),null}async function ac(){return!1}async function ad(e){try{return(await fetch("/api/v1/users/me/push-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fcm_token:e})})).ok}catch(e){return console.error("Error storing FCM token:",e),!1}}async function ap(){try{return(await fetch("/api/v1/users/me/push-token",{method:"DELETE"})).ok}catch(e){return console.error("Error removing FCM token:",e),!1}}function ah({locale:e,onSubscriptionChange:t}){let a=(0,p.useTranslations)("notifications"),[r,s]=(0,d.useState)(!1),[n,i]=(0,d.useState)(!1),[o,l]=(0,d.useState)(!1),[h,u]=(0,d.useState)(!1),[f,y]=(0,d.useState)("default"),[x,b]=(0,d.useState)({streak_reminder:!0,study_reminder:!0,exam_alert:!0,document_deadline:!0}),w=(0,d.useCallback)(()=>{i(!0),setTimeout(()=>{s(!1),i(!1),localStorage.setItem("notification_prompt_decided","true")},300)},[]),v=(0,d.useCallback)(async()=>{l(!0);try{let e=await ao();if(y(e),"granted"===e){let e=await al();e&&(await ad(e),u(!0),t?.(!0))}}catch(e){console.error("Error opting in to notifications:",e)}finally{l(!1),w()}},[w,t]),j=(0,d.useCallback)(async()=>{l(!0);try{await ac(),await ap(),u(!1),y("denied"),t?.(!1)}catch(e){console.error("Error opting out of notifications:",e)}finally{l(!1),w()}},[w,t]),N=(0,d.useCallback)(e=>{b(t=>({...t,[e]:!t[e]}))},[]);if("unsupported"===f||"denied"===f||"granted"===f&&!r||"granted"===f&&h&&!r)return null;let k=[{id:"streak_reminder",icon:c.jsx(m.Z,{className:"w-5 h-5"}),titleKey:"types.streakReminder",descriptionKey:"types.streakReminderDesc",enabled:x.streak_reminder},{id:"study_reminder",icon:c.jsx(G,{className:"w-5 h-5"}),titleKey:"types.studyReminder",descriptionKey:"types.studyReminderDesc",enabled:x.study_reminder},{id:"exam_alert",icon:c.jsx(J.Z,{className:"w-5 h-5"}),titleKey:"types.examAlert",descriptionKey:"types.examAlertDesc",enabled:x.exam_alert},{id:"document_deadline",icon:c.jsx(S.Z,{className:"w-5 h-5"}),titleKey:"types.documentDeadline",descriptionKey:"types.documentDeadlineDesc",enabled:x.document_deadline}];return r?(0,c.jsxs)("div",{className:(0,g.W)("fixed bottom-4 right-4 z-50 w-full max-w-md","bg-white rounded-2xl shadow-2xl overflow-hidden","border border-gray-100","transform transition-all duration-300 ease-out",n?"opacity-0 translate-y-4":"opacity-100 translate-y-0"),role:"dialog","aria-labelledby":"notification-prompt-title","aria-describedby":"notification-prompt-description",children:[c.jsx("div",{className:"bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4",children:(0,c.jsxs)("div",{className:"flex items-center justify-between",children:[(0,c.jsxs)("div",{className:"flex items-center gap-3",children:[c.jsx("div",{className:"bg-white/20 rounded-full p-2",children:c.jsx(X.Z,{className:"w-6 h-6 text-white"})}),(0,c.jsxs)("div",{children:[c.jsx("h2",{id:"notification-prompt-title",className:"text-lg font-semibold text-white",children:a("promptTitle")}),c.jsx("p",{id:"notification-prompt-description",className:"text-sm text-white/80",children:a("promptSubtitle")})]})]}),c.jsx("button",{onClick:j,className:"p-2 hover:bg-white/20 rounded-full transition-colors","aria-label":a("close"),children:c.jsx(U.Z,{className:"w-5 h-5 text-white"})})]})}),(0,c.jsxs)("div",{className:"p-6 space-y-4",children:[(0,c.jsxs)("div",{className:"space-y-3",children:[c.jsx("h3",{className:"text-sm font-medium text-gray-500 uppercase tracking-wider",children:a("notificationTypes")}),k.map(e=>(0,c.jsxs)("button",{onClick:()=>N(e.id),className:(0,g.W)("w-full flex items-center gap-3 p-3 rounded-xl transition-all","border-2",e.enabled?"border-primary-200 bg-primary-50":"border-gray-100 bg-gray-50 hover:border-gray-200"),children:[c.jsx("div",{className:(0,g.W)("rounded-full p-2 transition-colors",e.enabled?"bg-primary-100 text-primary-600":"bg-gray-200 text-gray-400"),children:e.icon}),(0,c.jsxs)("div",{className:"flex-1 text-left",children:[c.jsx("p",{className:(0,g.W)("font-medium",e.enabled?"text-gray-900":"text-gray-500"),children:a(e.titleKey)}),c.jsx("p",{className:"text-sm text-gray-500",children:a(e.descriptionKey)})]}),c.jsx("div",{className:(0,g.W)("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",e.enabled?"border-primary-500 bg-primary-500":"border-gray-300 bg-white"),children:e.enabled&&c.jsx(F.Z,{className:"w-4 h-4 text-white"})})]},e.id))]}),c.jsx("p",{className:"text-sm text-gray-500 text-center",children:a("privacyNote")})]}),(0,c.jsxs)("div",{className:"px-6 pb-6 flex gap-3",children:[c.jsx("button",{onClick:j,disabled:o,className:(0,g.W)("flex-1 py-3 px-4 rounded-xl font-medium transition-colors","border-2 border-gray-200 text-gray-600","hover:bg-gray-50","disabled:opacity-50 disabled:cursor-not-allowed"),children:a("notNow")}),c.jsx("button",{onClick:v,disabled:o,className:(0,g.W)("flex-1 py-3 px-4 rounded-xl font-medium transition-colors","bg-primary-600 text-white","hover:bg-primary-700","disabled:opacity-50 disabled:cursor-not-allowed"),children:o?(0,c.jsxs)("span",{className:"flex items-center justify-center gap-2",children:[c.jsx("span",{className:"w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"}),a("enabling")]}):a("enableNotifications")})]})]}):null}function au(){let e=(0,p.useTranslations)();(0,h.useRouter)();let[t,a]=(0,d.useState)(!0),[r,s]=(0,d.useState)(""),[n,i]=(0,d.useState)("en"),o=[{id:"1",type:"lesson_completed",title:"Completed lesson: Profit & Loss",description:"Mathematics • 45 mins",timestamp:new Date(Date.now()-18e5)},{id:"2",type:"test_completed",title:"Scored 72% in Mock Test 5",description:"General Intelligence • 45 mins",timestamp:new Date(Date.now()-108e5)},{id:"3",type:"streak_started",title:"Started a 5-day streak!",metadata:{streakDays:5},timestamp:new Date(Date.now()-864e5)},{id:"4",type:"lesson_completed",title:"Completed lesson: Ancient History",description:"General Knowledge • 30 mins",timestamp:new Date(Date.now()-936e5)}],l=new Date;return(l.setMonth(l.getMonth()+6),t)?c.jsx("div",{className:"min-h-screen flex items-center justify-center bg-gray-50",children:c.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"})}):(0,c.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[c.jsx(z,{}),c.jsx(ah,{locale:n}),(0,c.jsxs)("div",{className:"flex",children:[c.jsx(u.Y,{locale:n}),c.jsx("main",{className:"flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8",children:(0,c.jsxs)("div",{className:"max-w-7xl mx-auto space-y-6",children:[c.jsx("div",{className:"mb-8",children:c.jsx("h1",{className:"text-2xl lg:text-3xl font-bold text-gray-900",children:e("dashboard.welcome",{name:r})})}),(0,c.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[c.jsx("div",{className:"lg:col-span-2",children:c.jsx(f,{targetDate:l})}),c.jsx("div",{children:c.jsx(q,{planName:"monthly",renewalDate:new Date(Date.now()+1296e6),locale:n,isPremium:!0})})]}),c.jsx(k,{subjects:[{id:"1",name:"General Intelligence",code:"general-intelligence",completionPercentage:65,totalLessons:50,completedLessons:33},{id:"2",name:"Mathematics",code:"mathematics",completionPercentage:42,totalLessons:45,completedLessons:19},{id:"3",name:"General Knowledge",code:"general-knowledge",completionPercentage:78,totalLessons:60,completedLessons:47},{id:"4",name:"English",code:"english",completionPercentage:30,totalLessons:40,completedLessons:12}]}),(0,c.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[c.jsx(I,{tasks:[{id:"1",title:"Number Series",subject:"Mathematics",topic:"Quantitative Aptitude",type:"lesson",status:"pending"},{id:"2",title:"Coding-Decoding",subject:"General Intelligence",topic:"Reasoning",type:"test",status:"in_progress"},{id:"3",title:"Ancient History Revision",subject:"General Knowledge",topic:"History",type:"revision",status:"pending"}],locale:n}),c.jsx(L,{weakAreas:[{id:"1",topicName:"Percentage",subjectName:"Mathematics",accuracy:45,totalQuestions:20,correctAnswers:9},{id:"2",topicName:"Blood Relations",subjectName:"General Intelligence",accuracy:38,totalQuestions:15,correctAnswers:6},{id:"3",topicName:"Active/Passive Voice",subjectName:"English",accuracy:52,totalQuestions:25,correctAnswers:13}],locale:n})]}),(0,c.jsxs)("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[c.jsx("div",{className:"lg:col-span-1",children:c.jsx($,{currentStreak:5,longestStreak:12,isActive:!0})}),c.jsx("div",{className:"lg:col-span-2",children:c.jsx(R,{activities:o})})]})]})})]})]})}eK(new eu("messaging",e=>{let t=new t7(e.getProvider("app").getImmediate(),e.getProvider("installations-internal").getImmediate(),e.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",e=>as(t,e)),t},"PUBLIC")),eK(new eu("messaging-internal",e=>{let t=e.getProvider("messaging").getImmediate();return{getToken:e=>aa(t,e)}},"PRIVATE")),ez(an,ai),ez(an,ai,"esm2020"),process.env.NEXT_PUBLIC_FCM_API_KEY,process.env.NEXT_PUBLIC_FCM_AUTH_DOMAIN,process.env.NEXT_PUBLIC_FCM_PROJECT_ID,process.env.NEXT_PUBLIC_FCM_STORAGE_BUCKET,process.env.NEXT_PUBLIC_FCM_MESSAGING_SENDER_ID,process.env.NEXT_PUBLIC_FCM_APP_ID,a(66654)},5549:(e,t,a)=>{"use strict";a.d(t,{Y:()=>v});var r=a(10326),s=a(17577),n=a(23844),i=a(90434),o=a(35047),l=a(12592),c=a(23099),d=a(52443),p=a(56235),h=a(580),u=a(12066),m=a(61979),f=a(19031),g=a(9094),y=a(94611),x=a(74002),b=a(23861);let w=[{href:"/dashboard",icon:c.Z,labelKey:"nav.dashboard"},{href:"/study",icon:d.Z,labelKey:"nav.study"},{href:"/tests",icon:p.Z,labelKey:"nav.tests"},{href:"/physical",icon:h.Z,labelKey:"nav.physical"},{href:"/documents",icon:u.Z,labelKey:"nav.documents"},{href:"/analytics",icon:m.Z,labelKey:"nav.analytics"},{href:"/community",icon:f.Z,labelKey:"nav.community"},{href:"/profile",icon:g.Z,labelKey:"nav.profile"}];function v({locale:e}){let t=(0,n.useTranslations)(),a=(0,o.usePathname)(),[c,d]=(0,s.useState)(!1),p=e=>a===e||a.startsWith(e+"/");return(0,r.jsxs)(r.Fragment,{children:[r.jsx("button",{type:"button",onClick:()=>d(!0),className:"lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md","aria-label":t("dashboard.menu"),children:r.jsx(y.Z,{className:"w-6 h-6 text-gray-700"})}),c&&r.jsx("div",{className:"lg:hidden fixed inset-0 bg-black/50 z-40",onClick:()=>d(!1)}),r.jsx("aside",{className:(0,l.W)("fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out","lg:translate-x-0",c?"translate-x-0":"-translate-x-full"),children:(0,r.jsxs)("div",{className:"flex flex-col h-full",children:[(0,r.jsxs)("div",{className:"flex items-center justify-between p-4 border-b",children:[(0,r.jsxs)(i.default,{href:"/dashboard",className:"flex items-center gap-2",children:[r.jsx(x.Z,{className:"w-8 h-8 text-primary-600"}),r.jsx("span",{className:"text-xl font-bold text-primary-600",children:t("common.appName")})]}),r.jsx("button",{type:"button",onClick:()=>d(!1),className:"lg:hidden p-2 hover:bg-gray-100 rounded-lg","aria-label":t("dashboard.closeMenu"),children:r.jsx(b.Z,{className:"w-5 h-5 text-gray-500"})})]}),r.jsx("nav",{className:"flex-1 p-4 space-y-1",children:w.map(a=>{let s=a.icon,n=p(a.href);return(0,r.jsxs)(i.default,{href:`/${e}${a.href}`,onClick:()=>d(!1),className:(0,l.W)("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",n?"bg-primary-50 text-primary-700":"text-gray-700 hover:bg-gray-50"),children:[r.jsx(s,{className:(0,l.W)("w-5 h-5",n?"text-primary-600":"text-gray-500")}),r.jsx("span",{className:"font-medium",children:t(a.labelKey)})]},a.href)})}),r.jsx("div",{className:"p-4 border-t",children:r.jsx(i.default,{href:"/logout",className:"flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors",children:r.jsx("span",{className:"text-lg font-medium",children:t("nav.logout")})})})]})})]})}},55137:(e,t,a)=>{"use strict";a.d(t,{Z:()=>i});var r=a(66863);let s=process.env.NEXT_PUBLIC_API_URL||"http://localhost:3100",n=r.Z.create({baseURL:`${s}/api/v1`,withCredentials:!0,headers:{"Content-Type":"application/json"}});n.interceptors.request.use(e=>(e.url?.startsWith("/admin"),e),e=>Promise.reject(e)),n.interceptors.response.use(e=>e,async e=>{let t=e.config;if(e.response?.status===401&&!t._retry){t._retry=!0;try{return await n.post("/auth/refresh"),n(t)}catch(e){return Promise.reject(e)}}return Promise.reject(e)});let i=n},66654:(e,t,a)=>{"use strict";a.d(t,{T0:()=>n,ck:()=>s});var r=a(55137);async function s(e){return(await r.Z.patch("/users/me",e)).data}async function n(e){return(await r.Z.post("/users/onboarding/assessment",{answers:e})).data}},71272:(e,t,a)=>{"use strict";a.d(t,{Z:()=>l});var r=a(17577);/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),n=(...e)=>e.filter((e,t,a)=>!!e&&a.indexOf(e)===t).join(" ");/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,r.forwardRef)(({color:e="currentColor",size:t=24,strokeWidth:a=2,absoluteStrokeWidth:s,className:o="",children:l,iconNode:c,...d},p)=>(0,r.createElement)("svg",{ref:p,...i,width:t,height:t,stroke:e,strokeWidth:s?24*Number(a)/Number(t):a,className:n("lucide",o),...d},[...c.map(([e,t])=>(0,r.createElement)(e,t)),...Array.isArray(l)?l:[l]])),l=(e,t)=>{let a=(0,r.forwardRef)(({className:a,...i},l)=>(0,r.createElement)(o,{ref:l,iconNode:t,className:n(`lucide-${s(e)}`,a),...i}));return a.displayName=`${e}`,a}},580:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]])},47007:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]])},61979:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]])},95383:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]])},52443:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("BookOpen",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]])},3726:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]])},15907:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},771:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("CircleCheckBig",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},21303:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]])},12066:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("FileCheck",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m9 15 2 2 4-4",key:"1grp1n"}]])},56235:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},74002:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Flame",[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]])},23099:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},94611:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]])},14701:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]])},9094:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},19031:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]])},23861:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});/**
 * @license lucide-react v0.408.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,a(71272).Z)("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]])},38256:(e,t,a)=>{"use strict";a.r(t),a.d(t,{$$typeof:()=>i,__esModule:()=>n,default:()=>o});var r=a(68570);let s=(0,r.createProxy)(String.raw`/home/benito/Desktop/Ben/Benify/apps/web/src/app/dashboard/page.tsx`),{__esModule:n,$$typeof:i}=s;s.default;let o=(0,r.createProxy)(String.raw`/home/benito/Desktop/Ben/Benify/apps/web/src/app/dashboard/page.tsx#default`)},12592:(e,t,a)=>{"use strict";function r(){for(var e,t,a=0,r="",s=arguments.length;a<s;a++)(e=arguments[a])&&(t=function e(t){var a,r,s="";if("string"==typeof t||"number"==typeof t)s+=t;else if("object"==typeof t){if(Array.isArray(t)){var n=t.length;for(a=0;a<n;a++)t[a]&&(r=e(t[a]))&&(s&&(s+=" "),s+=r)}else for(r in t)t[r]&&(s&&(s+=" "),s+=r)}return s}(e))&&(r&&(r+=" "),r+=t);return r}a.d(t,{W:()=>r})}};var t=require("../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[948,891,404,184,543,731],()=>a(58775));module.exports=r})();