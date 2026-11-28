const URL="https://xhjtvtnhimqjgdmrxbzf.supabase.co";
const KEY="sb_publishable_aNNnBlHcl-GMv3Mh5_UnC_A_hZ7jUkxw";
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
function say(message){if(status)status.textContent=message;}
function card(b){
 const links=(b.website_url?'<a href="'+esc(b.website_url)+'" target="_blank" rel="noopener noreferrer">Website ↗</a> ':"")+
 (b.public_email?'<a href="mailto:'+esc(b.public_email)+'">Email</a> ':"")+
 (b.public_phone?'<a href="tel:'+esc(b.public_phone)+'">Call</a>':"");
 return '<article class="directory-card"><span>'+esc(b.category)+'</span><h3>'+esc(b.business_name)+'</h3><p>'+esc(b.city)+', '+esc(b.country)+'</p><p>'+esc(b.description)+'</p><p class="listing-links">'+links+'</p></article>';
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
  if(!window.supabase?.createClient){say("Portal library did not load. Refresh.");return;}
  db=window.supabase.createClient(URL,KEY);
  const {data,error}=await db.rpc("directory_portal_ready");
  if(error||data!==true){say("Portal setup could not be verified. Applications remain closed.");button.disabled=true;return;}
  await loadListings(true);
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
  publication_consent:f.get("publication_consent")==="on"
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
