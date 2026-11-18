(function(root){
'use strict';
const localDate=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const isOpen=t=>t.status!=='done';
const isUrgent=(t,today)=>isOpen(t)&&(t.priority==='urgent'||((!t.repeat_rule||t.repeat_rule==='none')&&t.due_date&&t.due_date<today));
function filterTasks(tasks,view,date,today,person,search){const q=search.trim().toLocaleLowerCase('ru');return tasks.filter(t=>(person==='all'||t.assignee===person)&&(!q||[t.title,t.project,t.notes].join(' ').toLocaleLowerCase('ru').includes(q))&&(view==='all'||(view==='today'&&isOpen(t)&&(t.due_date===today||(t.repeat_rule&&t.repeat_rule!=='none'&&t.due_date&&t.due_date<today)))||(view==='calendar'&&t.due_date===date)||(view==='urgent'&&isUrgent(t,today))||(view==='long'&&isOpen(t)&&t.horizon==='long')||(view==='done'&&!isOpen(t)))).sort((a,b)=>Number(!isOpen(a))-Number(!isOpen(b))||Number(isUrgent(b,today))-Number(isUrgent(a,today))||(a.due_date||'9999').localeCompare(b.due_date||'9999')||(a.due_time||'99').localeCompare(b.due_time||'99')||b.created_at.localeCompare(a.created_at))}
function monthCells(year,month){const first=new Date(year,month,1,12);const offset=(first.getDay()+6)%7;return Array.from({length:42},(_,i)=>{const d=new Date(year,month,1-offset+i,12);return {date:localDate(d),day:d.getDate(),outside:d.getMonth()!==month}})}
function nextOccurrence(t,today){const base=new Date((t.due_date||today)+'T12:00:00');const now=new Date(today+'T12:00:00');let d=new Date(base);const anchor=Number((t.repeat_anchor||t.due_date||today).slice(8,10));
if(t.repeat_rule==='monthly'){do{const y=d.getFullYear(),m=d.getMonth()+1;d=new Date(y,m,Math.min(anchor,new Date(y,m+1,0).getDate()),12)}while(d<=now)}else{const step=t.repeat_rule==='weekly'?7:1;do{d.setDate(d.getDate()+step);if(t.repeat_rule==='weekdays')while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+1)}while(d<=now)}return localDate(d)}
root.CRMCore={localDate,isOpen,isUrgent,filterTasks,monthCells,nextOccurrence};if(typeof module!=='undefined')module.exports=root.CRMCore;
})(typeof window!=='undefined'?window:globalThis);
