const SUPABASE_URL="https://xhjtvtnhimqjgdmrxbzf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_aNNnBlHcl-GMv3Mh5_UncA_hZ7jUkxw";
const FOUNDER="orbitalxfuture@gmail.com";const $=id=>document.getElementById(id);let db=null,ready=false;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const msg=(id,t)=>{$(id).textContent=t||"";};
async function verifyFounder(session){
 if(!session?.user?.email_confirmed_at||session.user.email?.toLowerCase()!==FOUNDER)return false;
 const {data,error}=await db.rpc("is_orbital_founder");
 return !error&&data===true;
}
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
  const {data,error}=await db.from("business_listings").select("id,business_name,category,city,country,is_published,published_at,expires_at").order("published_at",{ascending:false});
  if(error){$("approvedListings").textContent="Could not load listings.";return;}
  $("approvedListings").innerHTML=data?.length?data.map(x=>{
   const expired=new Date(x.expires_at).getTime()<=Date.now();
   return '<article class="approved-row"><div><strong>'+esc(x.business_name)+'</strong><p>'+esc(x.category)+' · '+esc(x.city)+', '+esc(x.country)+'</p><small>Published '+esc(new Date(x.published_at).toLocaleDateString())+' · Expires '+esc(new Date(x.expires_at).toLocaleDateString())+'</small></div><div class="listing-admin-actions"><span class="status-pill">'+(expired?"Expired":x.is_published?"Published":"Hidden")+'</span><button class="secondary" type="button" data-publish-id="'+esc(x.id)+'" data-publish-next="'+(!x.is_published)+'">'+(x.is_published?"Unpublish":"Republish")+'</button></div></article>';
  }).join(""):'<p class="muted">No approved listings yet.</p>';
  $("approvedListings").querySelectorAll("[data-publish-id]").forEach(b=>b.addEventListener("click",()=>setPublication(b.dataset.publishId,b.dataset.publishNext==="true",b)));
  $("approvedListings").querySelectorAll("[data-renew-id]").forEach(b=>b.addEventListener("click",()=>renewListing(b.dataset.renewId,b)));
 }catch(error){
  console.error("Approved listings could not load:",error);
  $("approvedListings").textContent="Approved listings could not be loaded right now.";
 }
}
async function setPublication(id,publish,button){
 if(!confirm(publish?"Republish this business profile?":"Hide this business profile from the public directory?"))return;
 button.disabled=true;
 msg("applicationMessage","Updating public listing status…");
 try{
  const {error}=await db.from("business_listings").update({is_published:publish}).eq("id",id);
  if(error){msg("applicationMessage","Listing status was not changed. Check founder permissions and try again.");return;}
  msg("applicationMessage",publish?"Business profile republished.":"Business profile hidden from public view.");
  await approved();
 }catch(error){
  console.error("Listing moderation failed:",error);
  msg("applicationMessage","The listing status could not be changed. Refresh and verify before retrying.");
 }finally{
  button.disabled=false;
 }
}
async function renewListing(id,button){
 if(!confirm("Only renew after the business reconfirms its details and asks to remain listed. Extend this Standard Listing for another 12 months?"))return;
 button.disabled=true;
 msg("applicationMessage","Renewing listing…");
 try{
  const expiresAt=new Date(Date.now()+365*24*60*60*1000).toISOString();
  const {error}=await db.from("business_listings").update({expires_at:expiresAt}).eq("id",id);
  if(error){msg("applicationMessage","The listing could not be renewed. Check founder permissions and try again.");return;}
  msg("applicationMessage","Listing renewed for 12 months.");
  await approved();
 }catch(error){
  console.error("Listing renewal failed:",error);
  msg("applicationMessage","Renewal could not be completed. Refresh and verify before retrying.");
 }finally{
  button.disabled=false;
 }
}
const reportLabels={incorrect_information:"Incorrect information",business_not_authorized:"Business did not authorize listing",misleading_claim:"Misleading or harmful claim",closed_business:"Business is closed",other:"Other concern"};
async function loadReports(){
 try{
  const {data,error}=await db.from("directory_reports").select("id,listing_id,listing_name,reason,details,contact_email,status,founder_notes,created_at").order("created_at",{ascending:false}).limit(100);
  if(error){$("directoryReports").textContent="Reports could not be loaded.";msg("reportMessage","Check founder access to the report queue.");return;}
  msg("reportMessage","");
  $("directoryReports").innerHTML=data?.length?data.map(r=>'<article class="application-card"><div class="application-title"><div><span class="status-pill">'+esc(r.status)+'</span><h3>'+esc(r.listing_name)+'</h3></div><small>'+esc(new Date(r.created_at).toLocaleString())+'</small></div><div class="application-details"><div class="application-detail"><span>Reason</span><p>'+esc(reportLabels[r.reason]||r.reason)+'</p></div><div class="application-detail"><span>Reporter email</span><p>'+esc(r.contact_email)+'</p></div><div class="application-detail"><span>Listing ID</span><p>'+esc(r.listing_id||"Listing no longer exists")+'</p></div><div class="application-detail"><span>Details</span><p>'+esc(r.details)+'</p></div></div><label>Private resolution note<textarea data-report-note="'+esc(r.id)+'" rows="2" maxlength="2000">'+esc(r.founder_notes||"")+'</textarea></label><div class="review-actions"><button class="secondary" data-report-status="investigating" data-report-id="'+esc(r.id)+'">Investigating</button><button data-report-status="resolved" data-report-id="'+esc(r.id)+'">Resolve</button><button class="danger" data-report-status="dismissed" data-report-id="'+esc(r.id)+'">Dismiss</button></div></article>').join(""):'<p class="muted">No listing reports received.</p>';
  $("directoryReports").querySelectorAll("[data-report-status]").forEach(b=>b.addEventListener("click",()=>updateReport(b.dataset.reportId,b.dataset.reportStatus,b)));
 }catch(error){
  console.error("Directory reports failed to load:",error);
  $("directoryReports").textContent="Reports could not be loaded because of a connection problem.";
 }
}
async function updateReport(id,status,button){
 const note=document.querySelector('[data-report-note="'+id+'"]').value.trim();
 if(["resolved","dismissed"].includes(status)&&!note){msg("reportMessage","Add a private note explaining how this report was resolved or why it was dismissed.");return;}
 if(status==="resolved"&&!confirm("Mark this report as resolved? Ensure any required listing correction or removal is complete."))return;
 if(status==="dismissed"&&!confirm("Dismiss this report?"))return;
 button.disabled=true;msg("reportMessage","Saving report decision…");
 try{
  const {error}=await db.from("directory_reports").update({status,founder_notes:note||null,resolved_at:status==="resolved"?new Date().toISOString():null}).eq("id",id);
  if(error){msg("reportMessage","Report decision was not saved. Refresh and try again.");return;}
  msg("reportMessage","Report status updated.");
  await loadReports();
 }catch(error){
  console.error("Report moderation failed:",error);
  msg("reportMessage","Could not update report. Refresh and verify before retrying.");
 }finally{button.disabled=false;}
}
async function loadApps(){
 try{
  const {data,error}=await db.from("business_submissions").select("id,business_name,category,country,city,description,website_url,public_email,public_phone,contact_name,contact_email,status,review_notes,submitted_at,subscription_plan,billing_currency,monthly_amount").in("status",["pending","changes_requested"]).order("submitted_at");
  if(error){$("applicationsList").textContent="Cannot load applications. Check that the SQL setup completed and this is the verified founder account.";msg("applicationMessage",error.message);return;}
  msg("applicationMessage","");
  $("applicationsList").innerHTML=data?.length?data.map(s=>{
   const fields=[["Category",s.category],["Location",s.city+", "+s.country],["Subscription",String(s.subscription_plan||"standard").toUpperCase()+" · "+s.billing_currency+" "+Number(s.monthly_amount).toFixed(s.billing_currency==="JMD"?0:2)+" / month"],["Description",s.description],["Website",s.website_url],["Public email",s.public_email],["Public phone",s.public_phone],["Applicant",s.contact_name],["Private contact email",s.contact_email],["Submitted",new Date(s.submitted_at).toLocaleString()]];
   const decisionButtons=s.status==="pending"
    ? '<button data-action="approve" data-id="'+s.id+'">Approve (payment required)</button><button class="secondary" data-action="request_changes" data-id="'+s.id+'">Request changes</button>'
    : '<p class="muted">Awaiting a new application from the business. This earlier application cannot be approved.</p>';
   return '<article class="application-card"><div class="application-title"><div><span class="status-pill">'+esc(s.status.replace("_"," "))+'</span><h3>'+esc(s.business_name)+'</h3></div><small>'+esc(s.id.slice(0,8))+'</small></div><div class="application-details">'+fields.filter(x=>x[1]).map(x=>'<div class="application-detail"><span>'+esc(x[0])+'</span><p>'+esc(x[1])+'</p></div>').join("")+'</div><label>Private review note<textarea id="review-'+s.id+'" rows="2" maxlength="2000">'+esc(s.review_notes||"")+'</textarea></label><div class="review-actions"><button class="secondary" data-email="'+esc(s.contact_email)+'" data-business="'+esc(s.business_name)+'" data-id="'+s.id+'">Draft email to applicant</button>'+decisionButtons+'<button class="danger" data-action="reject" data-id="'+s.id+'">Reject</button></div></article>';
  }).join(""):'<p class="muted">No applications waiting for review.</p>';
  $("applicationsList").querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>review(b.dataset.id,b.dataset.action,b)));
  $("applicationsList").querySelectorAll("[data-email]").forEach(b=>b.addEventListener("click",()=>{
   const note=$("review-"+b.dataset.id).value.trim();
   const subject="ORBITAL X FUTURE business listing application";
   const body="Hello "+b.dataset.business+",\n\nWe are contacting you about your business directory application.\n\n"+(note?"Information needed / review note: "+note:"Please reply if we need any additional information.")+"\n\nIf you need to update your details, please submit a new application through https://orbital-x-future.onrender.com/#advertise and mention this application reference: "+b.dataset.id+".\n\nRegards,\nORBITAL X FUTURE";
   window.location.href="mailto:"+encodeURIComponent(b.dataset.email)+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
  }));
  await approved();
  await loadPaymentQueue();
 }catch(error){
  console.error("Business applications could not load:",error);
  $("applicationsList").textContent="Applications could not be loaded because of a connection problem. Try Refresh.";
  msg("applicationMessage","The founder dashboard could not load the application queue.");
 }
}
async function review(id,decision,button){
 const reviewNote=$("review-"+id).value.trim();
 if(["request_changes","reject"].includes(decision)&&!reviewNote){const warning=decision==="reject"?"A rejection reason is required. Enter it in the Private review note box, then tap Reject again.":"A review note is required. Enter the requested changes, then tap Request changes again.";msg("applicationMessage",warning);const field=$("review-"+id);field.focus();field.scrollIntoView({behavior:"smooth",block:"center"});window.alert(warning);return;}
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

let paymentSettings={jamaica_instructions:"",international_instructions:""};
const planNames={standard:"Standard",premium:"Premium",featured:"Featured"};
const money=(amount,currency)=>new Intl.NumberFormat(currency==="JMD"?"en-JM":"en-US",{style:"currency",currency,maximumFractionDigits:currency==="JMD"?0:2}).format(Number(amount||0));
async function loadPaymentSettings(){
 try{const {data,error}=await db.rpc("get_directory_payment_settings");if(error)throw error;paymentSettings=data||paymentSettings;$("jamaicaPaymentInstructions").value=paymentSettings.jamaica_instructions||"";$("internationalPaymentInstructions").value=paymentSettings.international_instructions||"";msg("paymentSettingsMessage","Payment instructions loaded. Save after making changes.");}
 catch(error){console.error(error);msg("paymentSettingsMessage","Payment settings could not load. Check database setup.");}
}
async function savePaymentSettings(){
 const j=$("jamaicaPaymentInstructions").value.trim(),i=$("internationalPaymentInstructions").value.trim();$("savePaymentSettings").disabled=true;
 try{const {error}=await db.rpc("save_directory_payment_settings",{p_jamaica_instructions:j,p_international_instructions:i});if(error)throw error;paymentSettings={jamaica_instructions:j,international_instructions:i};msg("paymentSettingsMessage","Payment instructions saved securely.");}
 catch(error){msg("paymentSettingsMessage","Could not save payment instructions: "+(error.message||"Please retry."));}
 finally{$("savePaymentSettings").disabled=false;}
}
function paymentEmail(s){
 const currency=s.billing_currency||"USD",instructions=currency==="JMD"?paymentSettings.jamaica_instructions:paymentSettings.international_instructions;
 if(!instructions.trim()){msg("paymentSettingsMessage","Save the "+currency+" payment instructions before drafting emails.");return;}
 const plan=planNames[s.subscription_plan]||"Standard",subject="ORBITAL X FUTURE — "+plan+" directory subscription payment";
 const body="Hello "+s.contact_name+",\n\nYour business listing application for "+s.business_name+" has been approved. Your listing is not public yet. It will be published only after we independently verify receipt of your payment.\n\nPACKAGE: "+plan+"\nMONTHLY FEE: "+money(s.monthly_amount,currency)+" "+currency+"\nBILLING: Monthly\nAPPLICATION REFERENCE: "+s.id+"\n\nPAYMENT INSTRUCTIONS\n"+instructions+"\n\nPlease include your application reference with your payment and reply with the transaction reference. A receipt can help us identify the transaction, but it is not proof of cleared funds. Your subscription begins only when payment is confirmed and the listing is activated. Each paid period lasts one month.\n\nRegards,\nORBITAL X FUTURE";
 window.location.href="mailto:"+encodeURIComponent(s.contact_email)+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
}
async function markInstructionsSent(id,button){
 if(!confirm("Have you actually sent the payment instructions email?"))return;button.disabled=true;
 try{const {error}=await db.rpc("mark_directory_payment_instructions_sent",{p_submission_id:id});if(error)throw error;msg("paymentSettingsMessage","Payment instructions marked as sent.");await loadPaymentQueue();}
 catch(error){msg("paymentSettingsMessage","Could not update status: "+(error.message||"Please retry."));}
 finally{button.disabled=false;}
}
async function confirmPayment(id,button){
 const input=document.querySelector('[data-payment-reference="'+id+'"]'),reference=input?.value.trim()||"";
 if(!reference){msg("paymentSettingsMessage","Enter the transaction reference you independently verified.");input?.focus();return;}
 if(!confirm("Have you verified that the full amount has cleared in your own payment account? Confirming will publish this listing and start its one-month subscription."))return;
 button.disabled=true;
 try{const {error}=await db.rpc("confirm_directory_payment",{p_submission_id:id,p_payment_reference:reference,p_paid_at:new Date().toISOString()});if(error)throw error;msg("paymentSettingsMessage","Payment confirmed and listing activated.");await Promise.all([loadPaymentQueue(),approved()]);}
 catch(error){msg("paymentSettingsMessage","Payment was not confirmed: "+(error.message||"Refresh and verify status."));}
 finally{button.disabled=false;}
}
async function loadPaymentQueue(){
 try{
  const {data,error}=await db.from("business_submissions").select("id,business_name,contact_name,contact_email,country,city,subscription_plan,billing_currency,monthly_amount,payment_status,payment_reference").eq("status","approved_pending_payment").order("reviewed_at",{ascending:false});
  if(error)throw error;
  $("paymentQueue").innerHTML=data?.length?data.map(s=>'<article class="application-card"><div class="application-title"><div><span class="status-pill">'+esc((s.payment_status||"not_requested").replaceAll("_"," "))+'</span><h3>'+esc(s.business_name)+'</h3></div><small>'+esc(s.id.slice(0,8))+'</small></div><div class="application-details"><div class="application-detail"><span>Applicant</span><p>'+esc(s.contact_name)+' · '+esc(s.contact_email)+'</p></div><div class="application-detail"><span>Location</span><p>'+esc(s.city)+', '+esc(s.country)+'</p></div><div class="application-detail"><span>Subscription</span><p>'+esc(planNames[s.subscription_plan]||"Standard")+' · '+esc(money(s.monthly_amount,s.billing_currency))+' / month</p></div><div class="application-detail"><span>Payment reference</span><p>'+esc(s.payment_reference||"Not recorded")+'</p></div></div><div class="review-actions"><button type="button" class="secondary" data-draft-payment="'+esc(s.id)+'">Draft payment email</button><button type="button" class="secondary" data-mark-instructions="'+esc(s.id)+'">Mark instructions sent</button></div><label>Verified bank / transaction reference<input data-payment-reference="'+esc(s.id)+'" maxlength="160" placeholder="Enter reference after funds clear"></label><div class="review-actions"><button type="button" data-confirm-payment="'+esc(s.id)+'">Confirm payment & publish</button></div></article>').join(""):'<p class="muted">No approved applications are awaiting payment.</p>';
  $("paymentQueue").querySelectorAll("[data-draft-payment]").forEach(b=>b.addEventListener("click",()=>{const s=data.find(x=>x.id===b.dataset.draftPayment);if(s)paymentEmail(s);}));
  $("paymentQueue").querySelectorAll("[data-mark-instructions]").forEach(b=>b.addEventListener("click",()=>markInstructionsSent(b.dataset.markInstructions,b)));
  $("paymentQueue").querySelectorAll("[data-confirm-payment]").forEach(b=>b.addEventListener("click",()=>confirmPayment(b.dataset.confirmPayment,b)));
 }catch(error){console.error(error);$("paymentQueue").textContent="Payment queue unavailable. Check database setup and founder permissions.";}
}

async function init(){
 if(!window.supabase?.createClient){msg("loginMessage","Secure sign-in library did not load.");return;}
 try{
  db=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  ready=true;
  const {data,error}=await db.auth.getSession();
  if(error)throw error;
  const session=data?.session;
  if(session&&!(await verifyFounder(session))){await db.auth.signOut();msg("loginMessage","This account is not on the verified founder allowlist.");return;}
  show(Boolean(session));
  if(session)await Promise.all([notes(),loadApps(),loadReports(),loadPaymentSettings()]);
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
  if(!(await verifyFounder(data.session))){await db.auth.signOut();msg("loginMessage","This account is not on the verified founder allowlist.");return;}
  msg("loginMessage","");
  show(true);
  await Promise.all([notes(),loadApps(),loadReports(),loadPaymentSettings()]);
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
$("refreshApplications").addEventListener("click",loadApps);$("refreshReports").addEventListener("click",loadReports);$("refreshPayments").addEventListener("click",loadPaymentQueue);$("savePaymentSettings").addEventListener("click",savePaymentSettings);init();