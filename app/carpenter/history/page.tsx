import { supabase } from "@/lib/supabase"

export default async function History() {
  const { data } = await supabase
    .from("chat_history")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div style={{ padding: 20 }}>
      <h1>Chat History</h1>

      {data?.map((h) => (
        <div key={h.id}>
          <p><b>User:</b> {h.message}</p>
          <p><b>Bot:</b> {h.response}</p>
        </div>
      ))}
    </div>
  )
} 