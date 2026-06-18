"use client"

import { useEffect } from "react"

export default function TuqlasChat(){

useEffect(()=>{

const script=
document.createElement(
"script"
)

script.src=
"https://www.tuqlas.com/chatbot.js"

script.async=
true

script.setAttribute(
"data-key",
process.env
.NEXT_PUBLIC_TUQLAS_KEY!
)

document.body
.appendChild(
script
)

return()=>{

document.body
.removeChild(
script
)

}

},[])

return(

<div
id="tuqlas-chat"
/>

)

}