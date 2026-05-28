import React, { useState, useEffect, useRef } from 'react';
import {
Leaf,
TreeDeciduous,
Users,
MessageSquare,
User,
Calendar,
Trophy,
Globe,
Plus,
CheckCircle2,
Flame,
Newspaper,
ChevronRight,
Send,
Zap,
ShieldCheck,
Heart,
Sparkles,
Share2,
Bell
} from 'lucide-react';

// --- Constants & Styling ---
const APP_NAME = "BeLeaf"

const INITIAL_TASKS = [
{ id: 1, title: "Use a reusable water bottle", xp: 10, completed: true, difficulty: 'Easy' },
{ id: 2, title: "Compost kitchen scraps", xp: 20, completed: false, difficulty: 'Medium' },
{ id: 3, title: "Unplug idle electronics", xp: 15, completed: false, difficulty: 'Easy' },
];

const NEWS = [
{ id: 1, title: "Ocean Cleanup Project reaches milestone in Pacific.", tag: "Global" },
{ id: 2, title: "New solar technology increases efficiency by 20%.", tag: "Tech" },
{ id: 3, title: "Local community garden initiative feeds 500 families.", tag: "Local" }
];

const FRIENDS_FEED = [
{ id: 1, user: "EcoExplorer", action: "just planted an Oak!", time: "2m ago", avatar: "EE" },
{ id: 2, user: "GreenThumb", action: "completed 5-day streak!", time: "15m ago", avatar: "GT" },
{ id: 3, user: "WindPower", action: "joined the Clean Beach Quest", time: "1h ago", avatar: "WP" },
];

const LEADERBOARD = [
{ id: 1, name: "EcoWarrior_99", leaves: 1250, level: 14 },
{ id: 2, name: "GreenQueen", leaves: 1100, level: 12 },
{ id: 3, name: "SolarSam", leaves: 980, level: 11 },
];

// --- Helper: Gemini API Integration ---
const apiKey = ""

async function askLeafy(query) {
try {
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
contents: [{ parts: [{ text: query }] }],
systemInstruction: {
parts: [{ text: "You are Leafy, an adorable, living leaf mascot for the BeLeaf app. You are enthusiastic, use plenty of emojis (🌿, ✨, 🌱), and speak with a bubbly personality. You love helping people save the planet. Suggest 3 specific tasks when asked for ideas." }]
}
})
});
const data = await response.json();
return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm feeling a bit wilted! Let's try that again? 🌿"
} catch (err) {
return "Leafy is taking a quick photosynthesis nap! ☀️"
}
}

// --- Interactive Components ---

const MascotFloating = ({ mood = 'happy', onClick }) => (
<div
onClick={onClick}
className="fixed bottom-24 right-8 z-50 cursor-pointer group animate-bounce-slow"
>
<div className="relative">
<div className="absolute -top-12 -left-20 bg-white p-3 rounded-2xl shadow-xl text-xs font-bold border border-green-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
Tap me for tips! ✨
</div>
<div className="w-16 h-16 bg-green-500 rounded-full shadow-2xl flex items-center justify-center border-4 border-white overflow-hidden">
<div className="relative w-full h-full flex items-center justify-center">
<Leaf className="text-white w-10 h-10 transition-transform group-hover:scale-110" fill="currentColor" />
{/* Mascot Eyes */}
<div className="absolute top-6 left-5 flex space-x-2">
<div className="w-1.5 h-1.5 bg-green-900 rounded-full animate-pulse" />
<div className="w-1.5 h-1.5 bg-green-900 rounded-full animate-pulse" />
</div>
</div>
</div>
<div className="absolute -bottom-1 -right-1 bg-yellow-400 p-1 rounded-full border-2 border-white">
<Sparkles size={12} className="text-white" />
</div>
</div>
</div>
);

const TreeVisual = ({ leaves }) => {
const level = Math.floor(leaves/100) + 1;
const growthScale = 1 + (leaves % 100) / 400;
return (
<div className="relative flex flex-col items-center justify-center p-12 bg-white rounded-[40px] shadow-xl border-4 border-green-50 overflow-hidden min-h-[350px]">
<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent)] pointer-events-none" />
<div className="relative transition-all duration-1000 ease-out transform" style={{ scale: growthScale }}>
<TreeDeciduous
className="text-green-600 drop-shadow-[0_10px_20px_rgba(22,163,74,0.3)]"
size={180 + level * 5}
strokeWidth={1.2}
/>
{/* Procedural Leaves */}
{[...Array(Math.min(15, level * 3))].map((_, i) => (
<div
key={i}
className="absolute animate-float"
style={{
top: `${20 + Math.random() * 40}%`,
left: `${10 + Math.random() * 80}%`,
animationDelay: `${i * 0.8}s`
}}
>
<Leaf size={14 + Math.random() * 10} className="text-green-400 opacity-80" fill="currentColor" />
</div>
))}
</div>
<div className="mt-8 text-center relative z-10">
<h3 className="text-2xl font-black text-green-800">Ancient Sprout</h3>
<p className="text-green-600 font-bold">Level {level} Guardian</p>
</div>
</div>
);
};

export default function App() {
const [activeTab, setActiveTab] = useState('home');
const [leaves, setLeaves] = useState(250);
const [streak, setStreak] = useState(7);
const [tasks, setTasks] = useState(INITIAL_TASKS);
const [messages, setMessages] = useState([
{ role: 'assistant', content: "Hiiiii! I'm Leafy! 🌿 Ready to make the world a little greener today? Ask me anything! ✨" }
]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [showNotification, setShowNotification] = useState(false);

const carbonSaved = (leaves * 0.12).toFixed(1);

const toggleTask = (id) => {
setTasks(prev => prev.map(t => {
if (t.id === id) {
const newStatus = !t.completed;
if (newStatus) {
setLeaves(l => l + t.xp);
setShowNotification(true);
setTimeout(() => setShowNotification(false), 3000);
} else {
setLeaves(l => l - t.xp);
}
return { ...t, completed: newStatus };
}
return t;
}));
};

const handleSendMessage = async () => {
if (!input.trim()) return;
const userMsg = { role: 'user', content: input };
setMessages(prev => [...prev, userMsg]);
setInput("");
setLoading(true);
const response = await askLeafy(input);
setMessages(prev => [...prev, { role: 'assistant', content: response }]);
setLoading(false);
};

return (
<div className="flex h-screen bg-[#f7fff9] text-slate-900 font-sans overflow-hidden">
<style>{`
@keyframes float {
0%, 100% { transform: translateY(0) rotate(0); }
50% { transform: translateY(-10px) rotate(5deg); }
}
@keyframes bounce-slow {
0%, 100% { transform: translateY(0); }
50% { transform: translateY(-8px); }
}
.animate-float { animation: float 4s ease-in-out infinite; }
.animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
`}</style>

{/* --- Sidebar --- */}
<aside className="w-72 bg-white border-r-2 border-green-50 p-8 flex flex-col hidden lg:flex">
<div className="flex items-center space-x-3 mb-12">
<div className="bg-gradient-to-br from-green-400 to-green-600 p-2.5 rounded-2xl shadow-lg shadow-green-200">
<Leaf className="text-white w-7 h-7" fill="currentColor" />
</div>
<h1 className="text-3xl font-black text-green-800 tracking-tighter">BeLeaf</h1>
</div>
<nav className="flex-1 space-y-2">
{[
{ id: 'home', icon: Calendar, label: 'Dashboard' },
{ id: 'quests', icon: Zap, label: 'Side Quests' },
{ id: 'community', icon: Users, label: 'The Grove' },
{ id: 'chat', icon: MessageSquare, label: 'Talk to Leafy' },
{ id: 'profile', icon: User, label: 'My Impact' },
].map((item) => (
<button
key={item.id}
onClick={() => setActiveTab(item.id)}
className={`flex items-center w-full p-4 rounded-2xl font-bold transition-all duration-300 ${
activeTab === item.id
? 'bg-green-600 text-white shadow-xl shadow-green-100 scale-105'
: 'text-slate-400 hover:text-green-600 hover:bg-green-50'
}`}
>
<item.icon className="w-5 h-5 mr-4" />
{item.label}
</button>
))}
</nav>

<div className="mt-auto p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-[30px] border border-green-100">
<div className="flex items-center justify-between mb-3">
<span className="text-xs font-black text-green-700 uppercase tracking-widest">Level Progress</span>
<Sparkles size={14} className="text-yellow-500" />
</div>
<div className="h-3 w-full bg-white rounded-full overflow-hidden border border-green-100 p-0.5">
<div
className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
style={{ width: `${leaves % 100}%` }}
/>
</div>
<p className="text-[10px] text-green-600 font-bold mt-2 text-center">
{100 - (leaves % 100)} more leaves to Level {Math.floor(leaves/100) + 2}!
</p>
</div>
</aside>

{/* --- Main Content --- */}
<main className="flex-1 flex flex-col overflow-hidden relative">
{/* Global Celebration Notification */}
{showNotification && (
<div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
<div className="bg-yellow-400 text-white px-6 py-3 rounded-full shadow-2xl font-black flex items-center space-x-3">
<Sparkles />
<span>+15 Leaves Earned!</span>
</div>
</div>
)}

<MascotFloating onClick={() => setActiveTab('chat')} />

{/* Header */}
<header className="px-8 py-6 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-40">
<div>
<h2 className="text-sm font-black text-green-600 uppercase tracking-widest mb-1">Welcome back, Guardian</h2>
<h1 className="text-2xl font-black text-slate-800">Your Forest is Thriving ✨</h1>
</div>
<div className="flex items-center space-x-3">
<div className="hidden sm:flex flex-col items-end mr-4">
<span className="text-xs font-bold text-slate-400">Total Leaves</span>
<span className="text-xl font-black text-green-600">{leaves}</span>
</div>
<button className="p-3 bg-white border-2 border-green-50 rounded-2xl text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm">
<Bell size={20} />
</button>
<div className="h-12 w-12 rounded-2xl bg-slate-200 border-2 border-white shadow-md overflow-hidden">
<img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Jane`} alt="User" />
</div>
</div>
</header>

<div className="flex-1 overflow-y-auto p-8">
{activeTab === 'home' && (
<div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
{/* Left: Interactive Tree */}
<div className="lg:col-span-7 flex flex-col space-y-8">
<TreeVisual leaves={leaves} />
<div className="bg-white p-6 rounded-[35px] shadow-sm border border-green-50">
<div className="flex items-center justify-between mb-6">
<h3 className="font-black text-lg flex items-center text-slate-700">
<Newspaper className="w-5 h-5 mr-2 text-green-500" /> Eco-Pulse News
</h3>
<button className="text-xs font-bold text-green-500 uppercase">Latest Reports</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{NEWS.map(n => (
<div key={n.id} className="group cursor-pointer">
<div className="h-24 bg-green-50 rounded-2xl mb-3 overflow-hidden">
<div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 group-hover:scale-110 transition-transform" />
</div>
<span className="text-[9px] font-black bg-white border border-green-100 px-2 py-0.5 rounded-full text-green-600 uppercase mb-2 inline-block">
{n.tag}
</span>
<p className="text-xs font-bold text-slate-700 leading-tight group-hover:text-green-600 transition-colors">
{n.title}
</p>
</div>
))}
</div>
</div>
</div>

{/* Right: Daily Stats */}
<div className="lg:col-span-5 space-y-10">
<div className="bg-gradient-to-br from-orange-400 to-orange-500 p-8 rounded-[40px] text-white shadow-xl shadow-orange-100 relative overflow-hidden group">
<Flame className="absolute -right-4 -top-4 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform" />
<h4 className="text-sm font-black uppercase tracking-widest mb-1 opacity-80">Current Streak</h4>
<div className="text-6xl font-black mb-4">{streak} Days</div>
<div className="flex items-center space-x-2">
<Sparkles size={16} />
<span className="text-sm font-bold">You're on fire! Keep it up.</span>
</div>
</div>

<div className="bg-white p-8 rounded-[40px] shadow-sm border border-green-50">
<h3 className="font-black text-xl text-slate-800 mb-6 flex items-center">
<Calendar className="mr-3 text-green-500" /> Weekly Activity
</h3>
<div className="flex justify-between items-end h-32">
{[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
<div key={i} className="flex flex-col items-center group w-8">
<div
className={`w-full rounded-t-xl transition-all duration-500 bg-green-100 group-hover:bg-green-500`}
style={{ height: `${h}%` }}
/>
<span className="text-[10px] font-black text-slate-400 mt-2">
{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
</span>
</div>
))}
</div>
</div>
</div>
</div>
</div>
)}

{activeTab === 'quests' && (
<div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
<div className="text-center mb-8">
<h1 className="text-4xl font-black text-slate-800 mb-2">Today's Side Quests</h1>
<p className="text-slate-500 font-bold">Complete tasks to earn leaves and grow your tree!</p>
</div>

<div className="bg-white p-6 rounded-[30px] shadow-xl border-4 border-green-50 flex items-center focus-within:border-green-400 transition-colors">
<input
type="text"
placeholder="Got a unique eco-idea? Add it here..."
className="flex-1 outline-none text-lg font-bold px-4"
onKeyDown={(e) => {
if (e.key === 'Enter') {
const newTask = { id: Date.now(), title: e.target.value, xp: 15, completed: false, difficulty: 'Custom' };
setTasks([newTask, ...tasks]);
e.target.value = '';
}
}}
/>
<button className="bg-green-600 text-white p-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform">
<Plus />
</button>
</div>

<div className="grid gap-4">
{tasks.map(task => (
<div
key={task.id}
onClick={() => toggleTask(task.id)}
className={`group flex items-center p-6 rounded-[30px] cursor-pointer transition-all border-2 ${
task.completed
? 'bg-green-50 border-green-200 opacity-60'
: 'bg-white border-white shadow-md hover:shadow-xl hover:translate-x-2'
}`}
>
<div className={`w-10 h-10 rounded-2xl flex items-center justify-center mr-6 transition-all ${
task.completed ? 'bg-green-500 text-white rotate-[360deg]' : 'bg-slate-100 text-slate-300'
}`}>
<CheckCircle2 size={24} />
</div>
<div className="flex-1">
<h4 className={`text-xl font-black ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
{task.title}
</h4>
<div className="flex space-x-3 mt-1">
<span className="text-[10px] font-black uppercase text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+{task.xp} Leaves</span>
<span className="text-[10px] font-black uppercase text-slate-400">{task.difficulty}</span>
</div>
</div>
</div>
))}
</div>
</div>
)}

{activeTab === 'community' && (
<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-left-4 duration-500">
{/* Left: Community Rituals */}
<div className="lg:col-span-8 space-y-10">
<section>
<div className="flex items-center justify-between mb-6">
<h3 className="text-2xl font-black text-slate-800 flex items-center">
<Users className="mr-3 text-blue-500" /> The Grove Rituals
</h3>
<button className="text-sm font-bold text-blue-600">Browse Quests</button>
</div>
<div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
<div className="absolute top-0 right-0 p-8 opacity-10">
<Globe size={180} />
</div>
<div className="relative z-10">
<span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Global Event</span>
<h2 className="text-3xl font-black mt-4 mb-2">Ocean Plastic Clean-up</h2>
<p className="text-blue-100 font-bold mb-8 max-w-md">Collaborate with 1.2k others to remove 5 tons of beach plastic this month.</p>
<div className="flex items-center justify-between mb-2 text-sm font-black">
<span>68% Collected</span>
<span>3.4 / 5 Tons</span>
</div>
<div className="h-4 w-full bg-white/20 rounded-full overflow-hidden p-1">
<div className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: '68%' }} />
</div>
<div className="mt-8 flex -space-x-3">
{[1,2,3,4,5].map(i => (
<div key={i} className="w-10 h-10 rounded-full border-4 border-blue-500 bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-800">
U{i}
</div>
))}
<div className="w-10 h-10 rounded-full border-4 border-blue-500 bg-white/20 flex items-center justify-center text-[10px] font-black">
+1.2k
</div>
</div>
</div>
</div>
</section>

<section className="bg-white p-8 rounded-[40px] shadow-sm border border-green-50">
<h3 className="text-xl font-black text-slate-800 mb-6 flex items-center">
<Zap className="mr-3 text-yellow-500" /> Friends Activity
</h3>
<div className="space-y-6">
{FRIENDS_FEED.map(f => (
<div key={f.id} className="flex items-center group cursor-pointer">
<div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-black text-xl shadow-sm group-hover:rotate-6 transition-transform">
{f.avatar}
</div>
<div className="flex-1 ml-6">
<p className="font-black text-slate-800">{f.user} <span className="font-medium text-slate-500">{f.action}</span></p>
<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.time}</span>
</div>
<div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-colors">
<Heart size={18} fill="currentColor" />
</button>
<button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-500 hover:text-white transition-colors">
<Share2 size={18} />
</button>
</div>
</div>
))}
</div>
</section>
</div>

{/* Right: Leaderboard */}
<div className="lg:col-span-4 space-y-8">
<div className="bg-white p-8 rounded-[40px] shadow-sm border border-green-50">
<h3 className="text-xl font-black text-slate-800 mb-8 flex items-center">
<Trophy className="mr-3 text-yellow-500" /> Top Guardians
</h3>
<div className="space-y-4">
{LEADERBOARD.map((u, i) => (
<div key={u.id} className={`flex items-center p-4 rounded-3xl transition-all ${i === 0 ? 'bg-yellow-50 border-2 border-yellow-100 shadow-lg scale-105' : 'hover:bg-slate-50 border-2 border-transparent'}`}>
<div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mr-4 ${i === 0 ? 'bg-yellow-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
{i + 1}
</div>
<div className="flex-1">
<p className="font-black text-slate-800">{u.name}</p>
<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level {u.level}</p>
</div>
<div className="text-right">
<p className="font-black text-green-600">{u.leaves}</p>
<p className="text-[9px] font-black text-slate-300 uppercase">Leaves</p>
</div>
</div>
))}
</div>
<button className="w-full mt-8 py-4 text-sm font-black text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl hover:bg-slate-50 transition-colors">
View Full Ranking
</button>
</div>
</div>
</div>
)}

{activeTab === 'chat' && (
<div className="max-w-4xl mx-auto h-[calc(100vh-250px)] flex flex-col bg-white rounded-[40px] shadow-2xl border-4 border-green-50 overflow-hidden animate-in zoom-in-95 duration-300">
<div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 flex items-center space-x-6 relative overflow-hidden">
<div className="absolute top-0 left-0 w-full h-full opacity-10">
<Leaf size={200} className="absolute -top-10 -left-10" />
</div>
<div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl relative z-10 animate-bounce-slow">
<Leaf className="text-green-600 w-12 h-12" fill="currentColor" />
<div className="absolute top-1 right-1 w-4 h-4 bg-green-400 border-4 border-white rounded-full" />
</div>
<div className="relative z-10">
<h3 className="text-white font-black text-3xl leading-none tracking-tighter">Leafy AI</h3>
<p className="text-green-100 font-bold mt-2 flex items-center">
<Sparkles size={14} className="mr-2" /> Friendly Neighborhood Mascot
</p>
</div>
</div>
<div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fdfdfd]">
{messages.map((m, i) => (
<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
<div className={`max-w-[75%] p-6 rounded-[30px] shadow-sm ${
m.role === 'user'
? 'bg-green-600 text-white rounded-tr-none'
: 'bg-white text-slate-800 rounded-tl-none border-2 border-green-50'
}`}>
<p className="text-sm font-bold leading-relaxed">{m.content}</p>
</div>
</div>
))}
{loading && (
<div className="flex justify-start">
<div className="bg-white border-2 border-green-50 p-6 rounded-[30px] rounded-tl-none animate-pulse flex items-center space-x-3">
<div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" />
<div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]" />
<div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]" />
</div>
</div>
)}
</div>

<div className="p-6 bg-white border-t-2 border-green-50 flex space-x-4">
<input
value={input}
onChange={(e) => setInput(e.target.value)}
onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
placeholder="Ask me for eco-tips! 🌿..."
className="flex-1 bg-slate-50 border-2 border-transparent rounded-[20px] px-6 py-4 font-bold outline-none focus:bg-white focus:border-green-500 transition-all"
/>
<button
onClick={handleSendMessage}
disabled={loading}
className="bg-green-600 text-white p-4 rounded-[20px] hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-100"
>
<Send size={24} />
</button>
</div>
</div>
)}

{activeTab === 'profile' && (
<div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
<div className="bg-white p-12 rounded-[50px] shadow-xl border-4 border-green-50 relative overflow-hidden">
<div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-50" />
<div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
<div className="relative group">
<div className="w-40 h-40 rounded-[40px] bg-gradient-to-br from-green-400 to-green-600 border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden">
<img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Jane`} className="w-full h-full object-cover" alt="User" />
</div>
<div className="absolute -bottom-4 -right-4 bg-yellow-400 p-3 rounded-2xl border-4 border-white shadow-lg">
<Trophy className="text-white" size={20} />
</div>
</div>
<div className="flex-1 text-center md:text-left">
<div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2">
<h1 className="text-4xl font-black text-slate-800">Jane Doe</h1>
<span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mt-2 md:mt-0 self-center md:self-auto">Elite Guardian</span>
</div>
<p className="text-slate-400 font-bold text-lg mb-8 tracking-tight">Protecting the Grove since March 2024</p>
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
{[
{ label: 'Total Leaves', val: leaves, color: 'text-green-600' },
{ label: 'Global Rank', val: '#42', color: 'text-blue-600' },
{ label: 'Badges Earned', val: '24', color: 'text-orange-600' },
{ label: 'CO2 Saved', val: carbonSaved + 'kg', color: 'text-emerald-600' },
].map((stat, i) => (
<div key={i} className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
<p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
</div>
))}
</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
<div className="bg-white p-10 rounded-[40px] shadow-sm border border-green-50">
<h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center">
<Globe className="mr-4 text-blue-500" /> Carbon Passport
</h3>
<div className="space-y-8">
<div className="flex items-center justify-between">
<div>
<p className="text-3xl font-black text-slate-800">{carbonSaved} kg</p>
<p className="text-sm font-bold text-slate-400">Total Emissions Avoided</p>
</div>
<div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
<ShieldCheck size={32} />
</div>
</div>
<div className="p-6 bg-slate-50 rounded-[30px] border border-slate-100">
<p className="text-sm font-bold text-slate-600 mb-4 italic">"Your impact is equivalent to taking 1.5 cars off the road for a week!"</p>
<div className="flex space-x-2">
{[1,2,3].map(i => <div key={i} className="w-full h-2 bg-blue-500 rounded-full" />)}
<div className="w-full h-2 bg-slate-200 rounded-full" />
</div>
</div>
</div>
</div>

<div className="bg-white p-10 rounded-[40px] shadow-sm border border-green-50">
<h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center">
<Zap className="mr-4 text-yellow-500" /> Recent Accomplishments
</h3>
<div className="space-y-4">
{[
{ title: "Compost King", desc: "Composted for 30 days straight", icon: "🌱" },
{ title: "Power Saver", desc: "Reduced idle energy by 15%", icon: "⚡" },
{ title: "Community Leader", desc: "Joined 5 group rituals", icon: "👑" }
].map((badge, i) => (
<div key={i} className="flex items-center p-4 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-colors cursor-pointer">
<div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mr-5">
{badge.icon}
</div>
<div>
<h4 className="font-black text-slate-800">{badge.title}</h4>
<p className="text-xs font-bold text-slate-400">{badge.desc}</p>
</div>
<ChevronRight size={20} className="ml-auto text-slate-300" />
</div>
))}
</div>
</div>
</div>
</div>
)}
</div>

{/* Mobile Navigation */}
<nav className="lg:hidden bg-white/80 backdrop-blur-lg border-t border-green-50 p-4 flex justify-around items-center sticky bottom-0 z-50">
{[
{ id: 'home', icon: Calendar },
{ id: 'quests', icon: Zap },
{ id: 'chat', icon: MessageSquare },
{ id: 'community', icon: Users },
{ id: 'profile', icon: User },
].map((item) => (
<button
key={item.id}
onClick={() => setActiveTab(item.id)}
className={`p-3 rounded-2xl transition-all ${activeTab === item.id ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400'}`}
>
<item.icon size={24} />
</button>
))}
</nav>
</main>
</div>
);
}
