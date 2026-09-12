"use client"

import {
useState
}
from "react"

import {
supabase
}
from "@/lib/supabase"

import {
uploadImage
}
from "@/services/uploadImage"

export default function Techniques(){

const[
title,
setTitle
]=
useState("")

const[
description,
setDescription
]=
useState("")

const[
youtube,
setYoutube
]=
useState("")

const[
file,
setFile
]=
useState<any>()

async function save(){

let image=""

if(
file
){

image=
await uploadImage(

"technique-images",

file

)

}

const {
error
}
=
await supabase

.from(
"techniques"
)

.insert({

title,

description,

youtube,

image

})

if(error){

alert(
error.message
)

return

}

alert(
"Technique Saved"
)

setTitle("")
setDescription("")
setYoutube("")
}

return(

<div
className="p-10 space-y-4"
>

<h1
className="text-3xl font-bold"
>

Add Technique

</h1>

<input

placeholder="Technique"

value={
title
}

onChange={
e=>

setTitle(
e.target.value
)

}

/>

<textarea

placeholder="Description"

value={
description
}

onChange={
e=>

setDescription(
e.target.value
)

}

/>

<input

placeholder="Youtube URL"

value={
youtube
}

onChange={
e=>

setYoutube(
e.target.value
)

}

/>

<input

type="file"

accept="image/*"

onChange={
e=>

setFile(
e.target.files?.[0]
)

}

/>

<button

onClick={
save
}

>

Save Technique

</button>

</div>

)

}