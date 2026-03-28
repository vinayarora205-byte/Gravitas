"use client"
import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface Profile {
 id: string;
 full_name: string;
 role: string;
}

interface Match {
 id: string;
 chat_unlocked: boolean;
 job_listings?: {
 job_title: string;
 company_name: string;
 profiles: { full_name: string; email: string } | { full_name: string; email: string }[];
 };
 candidate_profiles?: {
 job_title: string;
 profiles: { full_name: string; email: string } | { full_name: string; email: string }[];
 }[];
}

interface Message {
 id: string;
 sender_id: string;
 content: string;
 created_at: string;
 profiles?: { full_name: string } | { full_name: string }[];
}


export default function DirectChatPage({ 
 params 
}: { 
 params: { match_id: string } 
}) {
 const { user } = useUser()
 const router = useRouter()
 const [messages, setMessages] = useState<Message[]>([])
 const [input, setInput] = useState("")
 const [match, setMatch] = useState<Match | null>(null)
 const [profile, setProfile] = useState<Profile | null>(null)
 const [loading, setLoading] = useState(true)
 const bottomRef = useRef<HTMLDivElement>(null)
 const inputRef = useRef<HTMLInputElement>(null)

 useEffect(() => {
 if (user) loadData()
 }, [user])

 useEffect(() => {
 bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
 }, [messages])

 async function loadData() {
 // Get current user profile
 const { data: p } = await supabase
 .from('profiles')
 .select('id, full_name, role')
 .eq('clerk_user_id', user!.id)
 .single()
 setProfile(p)

 // Get match details
 const { data: m } = await supabase
 .from('matches')
 .select(`
 *,
 job_listings(job_title, company_name, 
 profiles(full_name, email)),
 candidate_profiles:candidate_id(
 job_title,
 profiles:profile_id(full_name, email)
 )
 `)
 .eq('id', params.match_id)
 .single()
 
 // Fix candidate profiles join if needed
 if (m && m.candidate_profiles) {
 if (Array.isArray(m.candidate_profiles.profiles)) {
 m.candidate_profiles.profiles = m.candidate_profiles.profiles[0]
 }
 }
 setMatch(m)

 if (!m?.chat_unlocked) {
 setLoading(false)
 return
 }

 // Load messages
 const { data: msgs } = await supabase
 .from('direct_messages')
 .select('*, profiles:sender_id(full_name)')
 .eq('match_id', params.match_id)
 .order('created_at', { ascending: true })
 setMessages(msgs || [])
 setLoading(false)

 // Subscribe to new messages
 supabase
 .channel('direct-' + params.match_id)
 .on('postgres_changes', {
 event: 'INSERT',
 schema: 'public',
 table: 'direct_messages',
 filter: 'match_id=eq.' + params.match_id
 }, async (payload) => {
 // Fetch full message with profile data
 const { data: newMsg } = await supabase
 .from('direct_messages')
 .select('*, profiles:sender_id(full_name)')
 .eq('id', payload.new.id)
 .single()
 
 if (newMsg) {
 setMessages(prev => {
 if (prev.find(m => m.id === newMsg.id)) return prev;
 return [...prev, newMsg];
 })
 }
 })
 .subscribe()
 }

 async function sendMessage() {
 if (!input.trim() || !profile) return
 const content = input.trim()
 setInput("")
 
 await supabase.from('direct_messages').insert({
 match_id: params.match_id,
 sender_id: profile.id,
 content
 })
 
 inputRef.current?.focus()
 }

 if (loading) return (
 <div style={{
 display: 'flex', alignItems: 'center',
 justifyContent: 'center', height: '100vh',
 fontFamily: 'Inter, sans-serif',
 background: '#1a1a1a', color: '#fff'
 }}>Loading...</div>
 )

 if (!match?.chat_unlocked) return (
 <div style={{
 display: 'flex', flexDirection: 'column',
 alignItems: 'center', justifyContent: 'center',
 height: '100vh', fontFamily: 'Inter, sans-serif',
 background: '#1a1a1a', color: '#fff'
 }}>
 <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
 <h2 style={{ color: '#fff', marginBottom: '8px' }}>
 Chat Not Unlocked Yet
 </h2>
 <p style={{ color: '#888', marginBottom: '24px' }}>
 Both parties need to accept using Hiries
 </p>
 <button onClick={() => router.back()} style={{
 background: '#FF6B3D', color: 'white',
 padding: '10px 24px', borderRadius: '12px',
 border: 'none', cursor: 'pointer', fontWeight: 'bold'
 }}>Go Back</button>
 </div>
 )

 const otherParty = profile?.role === 'recruiter'
 ? (Array.isArray(match?.candidate_profiles) ? (match?.candidate_profiles[0] as any)?.profiles?.full_name : (match?.candidate_profiles as any)?.profiles?.full_name)
 : (Array.isArray(match?.job_listings?.profiles) ? (match?.job_listings?.profiles[0] as any)?.full_name : (match?.job_listings?.profiles as any)?.full_name)

 return (
 <div style={{
 display: 'flex', flexDirection: 'column',
 height: '100vh', background: '#1a1a1a',
 fontFamily: 'Inter, sans-serif', color: '#fff'
 }}>
 {/* Header */}
 <div style={{
 background: '#222', padding: '16px 24px',
 borderBottom: '1px solid #333',
 display: 'flex', alignItems: 'center',
 gap: '12px'
 }}>
 <button onClick={() => router.back()} style={{
 background: 'none', border: 'none',
 cursor: 'pointer', fontSize: '18px', color: '#fff'
 }}>←</button>
 <div style={{
 width: '40px', height: '40px',
 borderRadius: '50%', background: '#FF6B3D',
 display: 'flex', alignItems: 'center',
 justifyContent: 'center', color: 'white',
 fontWeight: '600'
 }}>
 {otherParty?.[0]?.toUpperCase() || '?'}
 </div>
 <div>
 <div style={{ fontWeight: '600', fontSize: '15px' }}>
 {otherParty}
 </div>
 <div style={{ fontSize: '12px', color: '#22c55e' }}>
 ✓ Chat Unlocked
 </div>
 </div>
 </div>

 {/* Messages */}
 <div style={{
 flex: 1, overflowY: 'auto',
 padding: '24px', paddingBottom: '100px'
 }}>
 {messages.length === 0 && (
 <div style={{
 textAlign: 'center', color: '#666',
 marginTop: '40px'
 }}>
 <div style={{ fontSize: '32px', marginBottom: '8px' }}>
 💬
 </div>
 <p>Chat unlocked! Say hello to {otherParty}</p>
 </div>
 )}
 {messages.map((msg: Message, i) => {
 const isMe = msg.sender_id === profile?.id
 const senderName = Array.isArray(msg.profiles) ? (msg.profiles[0] as any)?.full_name : (msg.profiles as any)?.full_name;
 return (
 <div key={i} style={{
 display: 'flex',
 justifyContent: isMe ? 'flex-end' : 'flex-start',
 marginBottom: '12px'
 }}>
 <div style={{
 maxWidth: '70%',
 padding: '12px 16px',
 borderRadius: isMe 
 ? '16px 16px 4px 16px'
 : '16px 16px 16px 4px',
 background: isMe ? '#FF6B3D22' : '#2A2A2A',
 border: isMe 
 ? '1px solid #FF6B3D44'
 : '1px solid #333',
 fontSize: '15px',
 lineHeight: '1.5',
 color: '#fff'
 }}>
 {!isMe && (
 <div style={{
 fontSize: '11px', color: '#FF6B3D',
 marginBottom: '4px', fontWeight: '600'
 }}>
 {senderName}
 </div>
 )}
 {msg.content}
 <div style={{
 fontSize: '10px', color: '#666',
 marginTop: '4px', textAlign: 'right'
 }}>
 {new Date(msg.created_at).toLocaleTimeString(
 [], { hour: '2-digit', minute: '2-digit' }
 )}
 </div>
 </div>
 </div>
 )
 })}
 <div ref={bottomRef} />
 </div>

 {/* Input */}
 <div style={{
 position: 'fixed', bottom: 0, left: 0, right: 0,
 background: '#222',
 borderTop: '1px solid #333',
 padding: '16px 24px',
 display: 'flex', gap: '12px',
 alignItems: 'center', zIndex: 100
 }}>
 <input
 ref={inputRef}
 autoFocus
 value={input}
 onChange={e => setInput(e.target.value)}
 onKeyDown={e => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault()
 sendMessage()
 }
 }}
 placeholder={'Message ' + otherParty + '...'}
 style={{
 flex: 1, padding: '12px 20px',
 borderRadius: '24px',
 border: '1px solid #333',
 fontSize: '15px', outline: 'none',
 background: '#1a1a1a', color: '#fff'
 }}
 />
 <button
 onClick={sendMessage}
 disabled={!input.trim()}
 style={{
 width: '44px', height: '44px',
 borderRadius: '50%',
 background: input.trim() ? '#FF6B3D' : '#333',
 border: 'none', cursor: 'pointer',
 fontSize: '18px', color: 'white'
 }}
 >→</button>
 </div>
 </div>
 )
}
