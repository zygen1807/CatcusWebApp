"use client"

import {
useEffect,
useState
}
from "react"

import {
supabase
}
from "@/lib/supabase"

import AdminCard
from "@/components/AdminCard"

export default function Dashboard(){

const[
stats,
setStats
]=
useState({

projects:0,
steps:0,
techniques:0

})

useEffect(()=>{

load()

},[])

async function load(){

const p=
await supabase
.from(
"furniture_projects"
)
.select(
"*",
{
count:"exact"
}
)

const s=
await supabase
.from(
"project_steps"
)
.select(
"*",
{
count:"exact"
}
)

const t=
await supabase
.from(
"techniques"
)
.select(
"*",
{
count:"exact"
}
)

setStats({

projects:
p.count||0,

steps:
s.count||0,

techniques:
t.count||0

})

}

return(

<div
className="p-10"

>

<h1>

Admin Dashboard

</h1>

<div
className="grid grid-cols-3 gap-5"

>

<AdminCard
title="Projects"
value={stats.projects}
/>

<AdminCard
title="Steps"
value={stats.steps}
/>

<AdminCard
title="Techniques"
value={stats.techniques}
/>

</div>

</div>

)

}