const SUPABASE_URL="https://xhjtvtnhimqjgdmrxbzf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_aNNnBlHcl-GMv3Mh5_UnC_A_hZ7jUkxw";
const FOUNDER="orbitalxfuture@gmail.com";const $=id=>document.getElementById(id);let db=null,ready=false;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const msg=(id,t)=>{$(id).textContent=t||"";};
const isFounder=s=>Boolean(s?.user?.email?.toLowerCase()===FOUNDER&&s.user.email_confirmed_at);
function show(on){$("loginView").hidden=on;$("dashboardView").hidden=!on;}
async function notes(){
 try{
  const {data,error}=await db.from("founder_notes").select("id,title,body,created_at").order("created_at",{ascending:false});
  if(error){$("notesList").textContent="Private notes unavailable; check SQL setup.";return;}
  $("notesList").innerHTML=data?.length?data.map(n=>'<article class="note"><strong>'+esc(n.title)+'</strong><p>'+esc(n.body)+'</p><time>'+esc(new Date(n.created_at).toLocaleString())+'</time></article>').join(""):'<p class="muted">No private notes yet.</p>';
 }catch(error){
  console.error("Private notes could not load:",error);
  $("notesList").textContent="Private notes could not be loaded right now.";
 }
}
async function approved(){
 try{
  const {data,error}=await db.from("business_listings").select("business_name,category,city,country,is_published,published_at").order("published_at",{ascending:false});
  if(error){$("approvedListings").textContent="Could not load listings.";return;}
  $("approvedListings").innerHTML=data?.length?data.map(x=>'<article class="approved-row"><div><strong>'+esc(x.business_name)+'</strong><p>'+esc(x.category)+' · '+esc(x.city)+', '+esc(x.country)+'</p></div><span class="status-pill">'+(x.is_published?"Published":"Hidden")+'</span></article>').join(""):'<p class="muted">No approved listings yet.</p>';
 }catch(error){
  console.error("Approved listings could not load:",error);
  $("approvedListings").textContent="Approved listings could not be loaded right now.";
 }
}
async function loadApps(){
 try{
  const {data,error}=await db.from("business_submissions").select("id,business_name,category,country,city,description,website_url,public_email,public_phone,contact_name,contact_email,status,review_notes,submitted_at").in("status",["pending","changes_requested"]).order("submitted_at");
  if(error){$("applicationsList").textContent="Cannot load applications. Check that the SQL setup completed and this is the verified founder account.";msg("applicationMessage",error.message);return;}
  msg("applicationMessage","");
  $("applicationsList").innerHTML=data?.length?data.map(s=>{
   const fields=[["Category",s.category],["Location",s.city+", "+s.country],["Description",s.description],["Website",s.website_url],["Public email",s.public_email],["Public phone",s.public_phone],["Applicant",s.contact_name],["Private contact email",s.contact_email],["Submitted",new Date(s.submitted_at).toLocaleString()]];
   return '<article class="application-card"><div class="application-title"><div><span class="status-pill">'+esc(s.status.replace("_"," "))+'</span><h3>'+esc(s.business_name)+'</h3></div><small>'+esc(s.id.slice(0,8))+'</small></div><div class="application-details">'+fields.filter(x=>x[1]).map(x=>'<div class="application-detail"><span>'+esc(x[0])+'</span><p>'+esc(x[1])+'</p></div>').join("")+'</div><label>Private review note<textarea id="review-'+s.id+'" rows="2" maxlength="2000">'+esc(s.review_notes||"")+'</textarea></label><div class="review-actions"><button class="secondary" data-email="'+esc(s.contact_email)+'" data-business="'+esc(s.business_name)+'" data-id="'+s.id+'">Draft email to applicant</button><button data-action="approve" data-id="'+s.id+'">Approve & publish</button><button class="secondary" data-action="request_changes" data-id="'+s.id+'">Request changes</button><button class="danger" data-action="reject" data-id="'+s.id+'">Reject</button></div></article>';
  }).join(""):'<p class="muted">No applications waiting for review.</p>';
  $("applicationsList").querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>review(b.dataset.id,b.dataset.action,b)));
  $("applicationsList").querySelectorAll("[data-email]").forEach(b=>b.addEventListener("click",()=>{
   const note=$("review-"+b.dataset.id).value.trim();
   const subject="ORBITAL X FUTURE business listing application";
   const body="Hello "+b.dataset.business+",\n\nWe are contacting you about your business directory application.\n\n"+(note?"Information needed / review note: "+note:"Please reply if we need any additional information.")+"\n\nIf you need to update your details, please submit a new application through https://orbital-x-future.onrender.com/#advertise and mention this application reference: "+b.dataset.id+".\n\nRegards,\nORBITAL X FUTURE";
   window.location.href="mailto:"+encodeURIComponent(b.dataset.email)+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
  }));
  await approved();
 }catch(error){
  console.error("Business applications could not load:",error);
  $("applicationsList").textContent="Applications could not be loaded because of a connection problem. Try Refresh.";
  msg("applicationMessage","The founder dashboard could not load the application queue.");
 }
}
async function review(id,decision,button){
 const reviewNote=$("review-"+id).value.trim();
 if(decision==="request_changes"&&!reviewNote){msg("applicationMessage","Add a private review note explaining what the applicant must change before requesting changes.");return;}
 if(decision==="approve"&&!confirm("Approve this business and publish its profile?"))return;
 if(decision==="reject"&&!confirm("Reject this application?"))return;
 button.disabled=true;
 msg("applicationMessage","Saving decision…");
 let saved=false;
 try{
  const {error}=await db.rpc("review_business_submission",{p_submission_id:id,p_decision:decision,p_review_notes:reviewNote||null});
  if(error){msg("applicationMessage","Not saved: "+error.message);return;}
  saved=true;
  msg("applicationMessage","Decision saved. Refreshing the queue…");
  await loadApps();
 }catch(error){
  console.error("Directory review action failed:",error);
  msg("applicationMessage",saved?"Decision saved, but the queue could not refresh. Use Refresh to verify.":"The decision could not be saved because of a connection problem. Refresh and check the application status before trying again.");
 }finally{
  button.disabled=false;
 }
}
async function init(){
 if(!window.supabase?.createClient){msg("loginMessage","Secure sign-in library did not load.");return;}
 try{
  db=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  ready=true;
  const {data,error}=await db.auth.getSession();
  if(error)throw error;
  const session=data?.session;
  if(session&&!isFounder(session)){await db.auth.signOut();msg("loginMessage","This is not the verified founder account.");return;}
  show(Boolean(session));
  if(session)await Promise.all([notes(),loadApps()]);
 }catch(error){
  console.error("Founder dashboard initialization failed:",error);
  msg("loginMessage","Secure sign-in could not connect. Check your connection and try again.");
 }
}
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!ready)return;
 $("loginButton").disabled=true;
 msg("loginMessage","Signing in securely…");
 try{
  const {data,error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  if(error){msg("loginMessage","Sign-in failed. Check credentials and Supabase Auth setup.");return;}
  if(!isFounder(data.session)){await db.auth.signOut();msg("loginMessage","This is not the verified founder account.");return;}
  msg("loginMessage","");
  show(true);
  await Promise.all([notes(),loadApps()]);
 }catch(error){
  console.error("Founder sign-in failed:",error);
  msg("loginMessage","Sign-in could not be completed because of a connection problem. Try again.");
 }finally{
  $("loginButton").disabled=false;
 }
});
$("signOutButton").addEventListener("click",async()=>{await db.auth.signOut();show(false);$("loginForm").reset();});
$("noteForm").addEventListener("submit",async e=>{
 e.preventDefault();
 $("saveNoteButton").disabled=true;
 try{
  const {error}=await db.from("founder_notes").insert({title:$("noteTitle").value.trim(),body:$("noteBody").value.trim()});
  if(error){msg("noteMessage","Could not save note. Check database setup.");return;}
  $("noteForm").reset();
  msg("noteMessage","Private note saved.");
  await notes();
 }catch(error){
  console.error("Founder note save failed:",error);
  msg("noteMessage","The note could not be saved because of a connection problem.");
 }finally{
  $("saveNoteButton").disabled=false;
 }
});
$("refreshApplications").addEventListener("click",loadApps);init();