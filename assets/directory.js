const URL="https://xhjtvtnhimqjgdmrxbzf.supabase.co";
const KEY="sb_publishable_aNNnBlHcl-GMv3Mh5_UncA_hZ7jUkxw";
const form=document.getElementById("businessApplicationForm");
const status=document.getElementById("applicationStatus");
const button=document.getElementById("applicationSubmit");
const list=document.getElementById("publicListings");
const filterForm=document.getElementById("directoryFilterForm");
const searchInput=document.getElementById("directorySearch");
const categoryInput=document.getElementById("directoryCategory");
const locationInput=document.getElementById("directoryLocation");
const moreButton=document.getElementById("directoryLoadMore");
const PAGE_SIZE=12;
const APPLICATIONS_OPEN=false;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
let db=null,offset=0,loading=false;
function createPublicClient(){
 const headers={apikey:KEY,Authorization:"Bearer "+KEY};
 return {
  async rpc(name,args={}){
   try{
    const response=await fetch(URL+"/rest/v1/rpc/"+encodeURIComponent(name),{
     method:"POST",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify(args)
    });
    const body=await response.text();
    let data=null;try{data=body?JSON.parse(body):null;}catch{}
    return {data,error:response.ok?null:(data||{message:body||"Request failed",status:response.status})};
   }catch(error){return {data:null,error};}
  },
  from(table){
   return {insert:async row=>{
    try{
     const response=await fetch(URL+"/rest/v1/"+encodeURIComponent(table),{
      method:"POST",headers:{...headers,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(row)
     });
     const body=await response.text();
     let error=null;if(!response.ok){try{error=JSON.parse(body);}catch{error={message:body||"Request failed",status:response.status};}}
     return {error};
    }catch(error){return {error};}
   }};
  }
 };
}
function say(message){if(status)status.textContent=message;}
function card(b){
 const links=(b.website_url?'<a href="'+esc(b.website_url)+'" target="_blank" rel="noopener noreferrer">Website ↗</a> ':"")+
 (b.public_email?'<a href="mailto:'+esc(b.public_email)+'">Email</a> ':"")+
 (b.public_phone?'<a href="tel:'+esc(b.public_phone)+'">Call</a> ':"");
 const tier=b.subscription_plan==="featured"?'<span class="sponsored-label">Featured · Sponsored</span>':b.subscription_plan==="premium"?'<span class="sponsored-label">Sponsored</span>':"";
 return '<article class="directory-card"><span>'+esc(b.category)+'</span>'+tier+'<h3>'+esc(b.business_name)+'</h3><p>'+esc(b.city)+', '+esc(b.country)+'</p><p>'+esc(b.description)+'</p><p class="listing-links">'+links+'</p><details class="listing-report"><summary>Report or request correction</summary><form class="listing-report-form" data-listing-id="'+esc(b.id)+'" data-listing-name="'+esc(b.business_name)+'"><label>Reason<select name="reason" required><option value="">Choose a reason</option><option value="incorrect_information">Incorrect information</option><option value="business_not_authorized">I represent this business and did not authorize this listing</option><option value="misleading_claim">Misleading or harmful claim</option><option value="closed_business">Business is closed</option><option value="other">Other concern</option></select></label><label>Details<textarea name="details" minlength="20" maxlength="1500" required placeholder="Explain what needs review (20–1,500 characters)."></textarea></label><label>Your email (private)<input name="contact_email" type="email" maxlength="254" required></label><button type="submit">Send report securely</button><p class="report-status" role="status" aria-live="polite"></p></form></details></article>';
}
async function loadListings(reset=false){
 if(!db||loading)return;
 loading=true;
 if(reset){offset=0;list.innerHTML='<p class="directory-intro">Searching approved businesses…</p>';moreButton.hidden=true;}
 moreButton.disabled=true;
 try{
  const {data,error}=await db.rpc("search_business_directory",{
   p_search:searchInput.value.trim()||null,
   p_category:categoryInput.value||null,
   p_location:locationInput.value.trim()||null,
   p_limit:PAGE_SIZE,
   p_offset:offset
  });
  if(error)throw error;
  if(reset)list.innerHTML="";
  if(!data?.length&&reset){
   list.innerHTML='<p class="directory-intro">No approved businesses match those filters yet.</p>';
  }else if(data?.length){
   list.insertAdjacentHTML("beforeend",data.map(card).join(""));
   offset+=data.length;
  }
  moreButton.hidden=!data||data.length<PAGE_SIZE;
 }catch(error){
  console.error("Directory search failed:",error);
  if(reset)list.innerHTML='<p class="directory-intro">Approved listings could not be loaded. Please try again.</p>';
  else list.insertAdjacentHTML("beforeend",'<p class="directory-intro">More listings could not be loaded. Please try again.</p>');
 }finally{
  loading=false;
  moreButton.disabled=false;
 }
}
async function start(){
 try{
  db=createPublicClient();
  // Public search remains available even while application intake is closed.
  await loadListings(true);
  const {data,error}=await db.rpc("directory_portal_ready");
  if(error||data!==true){
   button.disabled=true;
   button.textContent="Applications temporarily closed";
   say("Applications are closed during pre-launch testing. Approved listings remain searchable.");
   return;
  }
  if(!APPLICATIONS_OPEN){
   button.disabled=true;
   button.textContent="Applications temporarily closed";
   say("The directory is in pre-launch testing. Applications are temporarily closed.");
   return;
  }
  button.disabled=false;
  button.textContent="Submit application";
  say("Portal ready. Applications are reviewed before publication.");
 }catch(error){
  console.error("Directory portal setup check failed:",error);
  button.disabled=true;
  say("The application portal could not confirm its setup. Please try again later.");
 }
}
list?.addEventListener("submit",async e=>{
 const reportForm=e.target.closest(".listing-report-form");
 if(!reportForm)return;
 e.preventDefault();
 const submit=reportForm.querySelector("button[type=submit]");
 const message=reportForm.querySelector(".report-status");
 const values=new FormData(reportForm);
 const payload={
  listing_id:reportForm.dataset.listingId,
  listing_name:reportForm.dataset.listingName,
  reason:String(values.get("reason")||""),
  details:String(values.get("details")||"").trim(),
  contact_email:String(values.get("contact_email")||"").trim().toLowerCase()
 };
 submit.disabled=true;message.textContent="Sending securely…";
 try{
  const {error}=await db.from("directory_reports").insert(payload);
  if(error){
   message.textContent=error.message?.includes("Report limit")?"This email has reached the report limit. Please try again later.":"We could not submit the report. Check the details and try again.";
   return;
  }
  reportForm.reset();message.textContent="Report received. The founder will review it. Thank you.";
 }catch(error){
  console.error("Directory report submission failed:",error);
  message.textContent="A connection problem prevented submission. Please try again.";
 }finally{submit.disabled=false;}
});
filterForm?.addEventListener("submit",e=>{e.preventDefault();loadListings(true);});
moreButton?.addEventListener("click",()=>loadListings(false));
form?.addEventListener("submit",async e=>{
 e.preventDefault();
 if(!db||!APPLICATIONS_OPEN||button.disabled)return;
 const f=new FormData(form);
 if(String(f.get("company_fax")||"").trim()){
  form.reset();say("Thank you. Your application has been received.");return;
 }
 button.disabled=true;say("Submitting securely…");
 const row={
  subscription_plan:String(f.get("subscription_plan")||"standard"),
  business_name:String(f.get("business_name")||"").trim(),
  category:String(f.get("category")||""),
  country:String(f.get("country")||"").trim(),
  city:String(f.get("city")||"").trim(),
  description:String(f.get("description")||"").trim(),
  website_url:String(f.get("website_url")||"").trim()||null,
  public_email:String(f.get("public_email")||"").trim().toLowerCase()||null,
  public_phone:String(f.get("public_phone")||"").trim()||null,
  contact_name:String(f.get("contact_name")||"").trim(),
  contact_email:String(f.get("contact_email")||"").trim().toLowerCase(),
  authority_confirmed:f.get("authority_confirmed")==="on",
  privacy_consent:f.get("privacy_consent")==="on",
  publication_consent:f.get("publication_consent")==="on",
  subscription_terms_consent:f.get("subscription_terms_consent")==="on"
 };
 try{
  const {error}=await db.from("business_submissions").insert(row);
  if(error){
   if(error.message?.includes("Submission limit"))say("This email reached the daily submission limit. Try again tomorrow.");
   else if(error.code==="23505")say("An active application for this business and contact email already exists. Contact us if you need help.");
   else say("Submission failed. Please check your details and try again.");
   return;
  }
  form.reset();say("Application received. It is pending founder review. Submission does not guarantee approval.");
 }catch(error){
  console.error("Business application submission failed:",error);
  say("The application could not be submitted because of a connection problem. Please try again.");
 }finally{
  button.disabled=!APPLICATIONS_OPEN;
 }
});
start();
