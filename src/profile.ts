import {useEffect,useState} from 'react'
export type Profile={name:string;workspace:string}
export function readProfile():Profile{try{const p=JSON.parse(localStorage.getItem('lifeos.profile')||'null');if(p&&typeof p.name==='string'&&typeof p.workspace==='string')return p}catch{}return {name:'',workspace:'My workspace'}}
export function useProfile(){const [profile,setProfile]=useState(readProfile);useEffect(()=>{const refresh=()=>setProfile(readProfile());window.addEventListener('lifeos-profile',refresh);return()=>window.removeEventListener('lifeos-profile',refresh)},[]);return profile}
