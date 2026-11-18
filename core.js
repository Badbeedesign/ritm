(function(root){
'use strict';
const TIME_ZONE='Europe/Moscow';
const localDate=(d=new Date())=>new Intl.DateTimeFormat('sv-SE',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const civilDate=s=>new Date(s+'T12:00:00Z');
const dateKey=d=>d.toISOString().slice(0,10);
const recurring=t=>!!t.repeat_rule&&t.repeat_rule!=='none';
const isOpen=t=>t.status!=='done';
const isUrgent=(t,today)=>isOpen(t)&&(t.priority==='urgent'||(!recurring(t)&&t.due_date&&t.due_date<today));
function nextOccurrence(t,today){let d=civilDate(t.due_date||today),now=civilDate(today);const anchor=Number((t.repeat_anchor||t.due_date||today).slice(8,10));
if(t.repeat_rule==='monthly'){do{const y=d.getUTCFullYear(),m=d.getUTCMonth()+1;d=new Date(Date.UTC(y,m,Math.min(anchor,new Date(Date.UTC(y,m+1,0)).getUTCDate()),12))}while(d<=now)}else{const step=t.repeat_rule==='weekly'?7:1;do{d.setUTCDate(d.getUTCDate()+step);if(t.repeat_rule==='weekdays')while(d.getUTCDay()===0||d.getUTCDay()===6)d.setUTCDate(d.getUTCDate()+1)}while(d<=now)}return dateKey(d)}
function occursOn(t,date){const start=t.repeat_anchor||t.due_date;if(!start||date<start)return false;if(!recurring(t))return t.due_date===date;const d=civilDate(date),s=civilDate(start);if(t.repeat_rule==='daily')return true;if(t.repeat_rule==='weekdays')return d.getUTCDay()!==0&&d.getUTCDay()!==6;if(t.repeat_rule==='weekly')return Math.round((d-s)/86400000)%7===0;if(t.repeat_rule==='monthly')return d.getUTCDate()===Math.min(s.getUTCDate(),new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate());return false}
function occurrence(t,date){if(!recurring(t))return t;return {...t,occurrence_date:date,due_date:date,status:(t.completed_dates||[]).includes(date)?'done':'todo'}}
function tasksOnDate(tasks,date){return tasks.filter(t=>recurring(t)?occursOn(t,date):t.due_date===date).map(t=>occurrence(t,date))}
function currentTask(t,today){if(!recurring(t))return t;const start=t.repeat_anchor||t.due_date;if(!start)return t;let date=today<start?start:today;if(!occursOn(t,date))date=nextOccurrence({...t,due_date:start},date);return occurrence(t,date)}
function filterTasks(tasks,view,date,today,person,search){const q=search.trim().toLocaleLowerCase('ru');let rows=view==='calendar'?tasksOnDate(tasks,date):view==='today'?tasksOnDate(tasks,today):tasks.map(t=>currentTask(t,today));return rows.filter(t=>(person==='all'||t.assignee===person)&&(!q||[t.title,t.project,t.notes].join(' ').toLocaleLowerCase('ru').includes(q))&&(view==='all'||(view==='today'&&isOpen(t))||view==='calendar'||(view==='urgent'&&isUrgent(t,today))||(view==='long'&&isOpen(t)&&t.horizon==='long')||(view==='done'&&!isOpen(t)))).sort((a,b)=>Number(!isOpen(a))-Number(!isOpen(b))||Number(isUrgent(b,today))-Number(isUrgent(a,today))||(a.due_date||'9999').localeCompare(b.due_date||'9999')||(a.due_time||'99').localeCompare(b.due_time||'99')||(b.created_at||'').localeCompare(a.created_at||''))}
function monthCells(year,month){const first=new Date(Date.UTC(year,month,1,12)),offset=(first.getUTCDay()+6)%7;return Array.from({length:42},(_,i)=>{const d=new Date(Date.UTC(year,month,1-offset+i,12));return {date:dateKey(d),day:d.getUTCDate(),outside:d.getUTCMonth()!==month}})}
function completionPatch(t,date){if(!recurring(t))return {status:t.status==='done'?'todo':'done'};const days=new Set(t.completed_dates||[]);if(days.has(date))days.delete(date);else days.add(date);return {status:'todo',completed_dates:[...days].sort()}}
root.CRMCore={TIME_ZONE,localDate,civilDate,dateKey,recurring,isOpen,isUrgent,filterTasks,monthCells,nextOccurrence,occursOn,occurrence,tasksOnDate,currentTask,completionPatch};if(typeof module!=='undefined')module.exports=root.CRMCore;
})(typeof window!=='undefined'?window:globalThis);
