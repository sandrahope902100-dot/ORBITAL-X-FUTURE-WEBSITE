const URL="https://xhjtvtnhimqjgdmrxbzf.supabase.co",KEY="sb_publishable_aNNnBlHcl-GMv3Mh5_UnC_A_hZ7jUkxw";const form=document.getElementById("businessApplicationForm"),status=document.getElementById("applicationStatus"),button=document.getElementById("applicationSubmit"),list=document.getElementById("publicListings");const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));let db=null;function say(t){if(status)status.textContent=t;}
async function loadListings(){
  try{
    const {data,error}=await db.from("business_listings").select("business_name,category,country,city,description,website_url,public_email,public_phone").eq("is_published",true).order("business_name").limit(60);
    if(error){list.innerHTML='<p class="directory-intro">Approved listings will appear here when the database is activated.</p>';return;}
    if(!data?.length){list.innerHTML='<p class="directory-intro">No approved businesses yet. Apply for a free Standard Listing.</p>';return;}
    list.innerHTML=data.map(b=>'<article class="directory-card"><span>'+esc(b.category)+'</span><h3>'+esc(b.business_name)+'</h3><p>'+esc(b.city)+', '+esc(b.country)+'</p><p>'+esc(b.description)+'</p><p class="listing-links">'+(b.website_url?'<a href="'+esc(b.website_url)+'" target="_blank" rel="noopener noreferrer">Website ↗</a> ':"")+(b.public_email?'<a href="mailto:'+esc(b.public_email)+'">Email</a> ':"")+(b.public_phone?'<a href="tel:'+esc(b.public_phone)+'">Call</a>':"")+'</p></article>').join("");
  }catch(error){console.error("Directory listings could not load:",error);list.innerHTML='<p class="directory-intro">Approved listings could not be loaded right now.</p>';}
}
async function start(){
  try{
    if(!window.supabase?.createClient){say("Portal library did not load. Refresh.");return;}
    db=window.supabase.createClient(URL,KEY);
    const {data,error}=await db.rpc("directory_portal_ready");
    if(error||data!==true){say("Portal setup is not finished or could not be verified. The application form will open after database setup.");return;}
    button.disabled=false;
    say("Portal ready. Applications are reviewed before publication.");
    await loadListings();
  }catch(error){
    console.error("Directory portal setup check failed:",error);
    button.disabled=true;
    say("The application portal could not confirm its setup. Please try again later.");
  }
}
if(form)form.addEventListener("submit",async e=>{e.preventDefault();if(!db||button.disabled)return;const f=new FormData(form);if(String(f.get("company_fax")||"").trim()){form.reset();say("Thank you. Your application has been received.");return;}button.disabled=true;say("Submitting securely…");const row={business_name:String(f.get("business_name")).trim(),category:String(f.get("category")),country:String(f.get("country")).trim(),city:String(f.get("city")).trim(),description:String(f.get("description")).trim(),website_url:String(f.get("website_url")).trim()||null,public_email:String(f.get("public_email")).trim()||null,public_phone:String(f.get("public_phone")).trim()||null,contact_name:String(f.get("contact_name")).trim(),contact_email:String(f.get("contact_email")).trim().toLowerCase(),authority_confirmed:f.get("authority_confirmed")==="on",privacy_consent:f.get("privacy_consent")==="on",publication_consent:f.get("publication_consent")==="on"};try{const {error}=await db.from("business_submissions").insert(row);if(error){say(error.message.includes("Submission limit")?"This email reached the daily submission limit. Try again tomorrow.":"Submission failed. Please check your details and try again.");return;}form.reset();say("Application received. It is pending founder review. Submission does not guarantee approval.");}catch(error){console.error("Business application submission failed:",error);say("The application could not be submitted because of a connection problem. Please try again.");}finally{button.disabled=false;}});start();