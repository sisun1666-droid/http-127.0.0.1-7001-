
    function localDateString(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
    const today=localDateString(),appBuildVersion="2026-06-07-0605-operational-rehearsal",storageKey="solar-admin-state-v1",viewStorageKey="solar-admin-current-view",legacyStorageKeys=["solar-admin-prototype-v3","solar-admin-prototype-v2"];
    const SUPABASE_URL="https://cldlugowplsswabyqxdh.supabase.co",SUPABASE_ANON_KEY="sb_publishable_Lik-AfYlzrW4eCWTZaPW5Q_OP1r0yk6",SUPABASE_STATE_URL=`${SUPABASE_URL}/rest/v1/app_state?id=eq.main`;
    const defaults={brand:"1577-1577",title:"기술지원팀 업무관리",subtitle:"기술지원팀 업무를 한 화면에서 관리합니다.",adminPin:"1234",nav:[{icon:"⌂",label:"대시보드"},{icon:"☑",label:"할일관리"},{icon:"⌖",label:"외근현황"},{icon:"✉",label:"메세지"},{icon:"▣",label:"보고서"},{icon:"▤",label:"회의록"},{icon:"◉",label:"시공일정"},{icon:"⚖",label:"시공배분"},{icon:"▦",label:"DB"},{icon:"▤",label:"프로젝트 파일"},{icon:"▣",label:"MW"},{icon:"◉",label:"구조물 검수"},{icon:"⚙",label:"관리자"}],phases:["고객상담","현장조사","인허가","한전접수","설계검토","자재발주","시공중","준공"],statuses:["정상","대기","보완","지연","완료"],constructionTeams:["남해","다온","다호","동광","금태양","JW","보강"],structureTeams:["보틸","쇼후르","잠시드","일고르","아와즈벡","마흐무드","살도르벡","자모르딘","시로즈벡","도스톤","아지즈","JW1팀","JW2팀"],constructionPhases:["자재입고완료","구조물시공","전기시공","보강공사","완료"],people:[{name:"이재강",role:"과장",area:"담당업무 미입력",monthlyTarget:30,yearlyTarget:360,pin:"0217"}],projects:[],construction:[],assignments:[],todos:[],assignmentStatuses:["지시","진행","검토요청","완료","보류"],geminiKey:"",sheetsUrl:"",sheetsSecret:""};
    const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),els={nav:$("#nav"),kpis:$("#kpis"),brandName:$("#brandName"),pageTitle:$("#pageTitle"),pageSub:$("#pageSub"),dashboardView:$("#dashboardView"),adminView:$("#adminView"),mainGrid:$("#mainGrid"),tableTitle:$("#tableTitle"),tableHead:$("#tableHead"),rows:$("#rows"),search:$("#search"),phaseFilter:$("#phaseFilter"),tableFilters:$("#tableFilters"),tableWrap:$("#tableWrap"),assignmentCalendarPanel:$("#assignmentCalendarPanel"),assignmentCalendarGrid:$("#assignmentCalendarGrid"),assignmentCalendarYear:$("#assignmentCalendarYear"),assignmentCalendarMonth:$("#assignmentCalendarMonth"),dbPasteBtn:$("#dbPasteBtn"),undoDbImportBtn:$("#undoDbImportBtn"),dbPasteText:$("#dbPasteText"),dbImportPreview:$("#dbImportPreview"),calendarGrid:$("#calendarGrid"),calendarYear:$("#calendarYear"),calendarMonth:$("#calendarMonth"),employeeTabs:$("#employeeTabs"),peoplePanel:$("#peoplePanel"),employeeKpiPanel:$("#employeeKpiPanel"),assignmentsPanel:$("#assignmentsPanel"),todosPanel:$("#todosPanel"),constructionReportPanel:$("#constructionReportPanel"),constructionReportYear:$("#constructionReportYear"),constructionReportMonth:$("#constructionReportMonth"),constructionReport:$("#constructionReport"),currentPlantsPanel:$("#currentPlantsPanel"),upcomingPlantsPanel:$("#upcomingPlantsPanel"),currentPlants:$("#currentPlants"),upcomingPlants:$("#upcomingPlants"),people:$("#people"),employeeKpis:$("#employeeKpis"),assignments:$("#assignments"),todos:$("#todos"),kpiYear:$("#kpiYear"),kpiMonth:$("#kpiMonth"),toast:$("#toast")};
    let state=loadState();loadSvrIds();let currentView=["dashboard","admin","assignments","construction","todos","projects","drive","reports","db","fieldwork","meetings","epc","messages","alloc","structureInspect"].includes(localStorage.getItem(viewStorageKey))?localStorage.getItem(viewStorageKey):"dashboard",employeeSubView="assignments",assignmentPersonFilter="전체",assignmentCalendarView="month",todoStatusFilter="\uC804\uCCB4",todoOwnerFilter="\uC804\uCCB4",todoViewMode="board",todoPanelTab="tasks",diaryDateCursor=today,editingTodoIndex=null,adminUnlocked=false,adminBasicEditMode=false,editingProjectIndex=null,editingAssignmentIndex=null,editingPersonIndex=null,editingConstructionIndex=null,sharedLoaded=false,columnFilters={projects:{},assignments:{},construction:{}},sortState={projects:{key:"",dir:"asc"},assignments:{key:"",dir:"asc"},construction:{key:"",dir:"asc"}},pendingDbImport=[];if(!adminUnlocked&&["admin","construction","db","drive"].includes(currentView)){currentView="dashboard";localStorage.setItem(viewStorageKey,currentView)}
    let authUser=null,authReady=false;
    const staffSessionKey="solar-staff-session-v1";
    const adminUnlockKey="solar-admin-unlocked",adminOwnerKey="solar-admin-owner";
    function cleanEmail(v){return String(v||"").trim().toLowerCase()}
    function authMsg(msg){const el=$("#authMessage");if(el)el.textContent=msg}
    function showAuthGate(msg="직원 이름과 개인 PIN을 입력해주세요."){document.body.classList.add("auth-pending");authMsg(msg)}
    function showApp(){authReady=true;loadSharedState(true).finally(()=>{if(!authUser)return;render();ensureSheetSyncButton();document.body.classList.remove("auth-pending");
      /* ── 새 테이블로 마이그레이션: Supabase에서 이미 데이터를 불러왔으면 완료 처리만 ── */
      setTimeout(()=>{
        if(!authUser)return;
        const migKey="solar-new-table-migrated-v1";
        if(localStorage.getItem(migKey)==="done")return;
        /* Supabase에서 데이터를 성공적으로 불러온 경우 → 덮어쓰기 금지, 완료 표시만 */
        if(sharedLoaded){localStorage.setItem(migKey,"done");return;}
        /* Supabase 연결 실패 등 예외 케이스에서만 로컬 데이터 업로드 */
        state.__updatedAt=Date.now();
        state.__lastSavedAt=new Date().toISOString();
        state.__lastSavedAtText=new Date().toLocaleString("ko-KR");
        pushSharedState().then(ok=>{
          if(ok){localStorage.setItem(migKey,"done");toast("✅ 팀 동기화 초기화 완료!");}
        }).catch(()=>{});
      },5000);
    })}
    function staffPin(p){return String(p?.pin||p?.staffPin||p?.loginPin||"")}
    const fallbackStaff=[
      {name:"이재강",role:"과장",pin:"0217"},
      {name:"김현지",role:"대리",pin:"1234"},
      {name:"최호운",role:"과장",pin:"1234"},
      {name:"최형민",role:"대리",pin:"1234"},
      {name:"김하린",role:"대리",pin:"1234"},
      {name:"안승표",role:"대리",pin:"1234"}
    ];
    function ensureDefaultStaffPins(){
      state.people=Array.isArray(state.people)?state.people:[];
      let changed=false;
      fallbackStaff.forEach(base=>{
        let p=state.people.find(x=>x.name===base.name);
        if(!p){
          p={name:base.name,role:base.role,area:"담당업무 미입력",monthlyTarget:30,yearlyTarget:360,pin:base.pin};
          state.people.push(p);
          changed=true;
        }else{
          if(!p.role)p.role=base.role;
          if(!staffPin(p)){p.pin=base.pin;changed=true}
        }
      });
      if(changed){
        localStorage.setItem(storageKey,JSON.stringify(state));
        if(sharedLoaded)persistState();
      }
    }
    function fillStaffLoginNames(){ensureDefaultStaffPins();const s=$("#staffLoginName");if(!s)return;const current=s.value||"";s.innerHTML=`<option value="">직원 선택</option>`+(state.people||[]).map(p=>`<option value="${esc(p.name)}">${esc(p.name)}</option>`).join("");s.value=[...s.options].some(o=>o.value===current)?current:""}
    function staffSession(){try{return JSON.parse(localStorage.getItem(staffSessionKey)||sessionStorage.getItem(staffSessionKey)||"null")}catch{return null}}
    function loginName(){return authUser?.user_metadata?.name||authUser?.user_metadata?.full_name||authUser?.email||""}
    function setStaffSession(person){if(sessionStorage.getItem(adminOwnerKey)!==person.name){adminUnlocked=false;sessionStorage.removeItem(adminUnlockKey);sessionStorage.removeItem(adminOwnerKey)}authUser={email:person.email||`${person.name}@staff.local`,user_metadata:{name:person.name,full_name:person.name},staff:true};localStorage.setItem(staffSessionKey,JSON.stringify({name:person.name,email:authUser.email,at:Date.now()}));sessionStorage.removeItem(staffSessionKey)}
    function clearStaffSession(){adminUnlocked=false;localStorage.removeItem(staffSessionKey);sessionStorage.removeItem(staffSessionKey);sessionStorage.removeItem(adminUnlockKey);sessionStorage.removeItem(adminOwnerKey);if(currentView==="admin"){currentView="dashboard";localStorage.setItem(viewStorageKey,currentView)}}
    function acceptStaffSession(){const sess=staffSession();if(!sess?.name)return false;const person=(state.people||[]).find(p=>p.name===sess.name);if(!person)return false;setStaffSession(person);$("#googleLogoutBtn")?.classList.remove("hidden");showApp();return true}
    function setLoginButtonState(loading=false,label="업무관리 로그인"){const b=$("#staffLoginBtn");if(!b)return;b.classList.toggle("auth-loading",loading);b.classList.remove("auth-clicked");b.disabled=!!loading;b.textContent=label}
    function showLoginError(msg){setLoginButtonState(false);authMsg(msg);const card=$(".auth-card");card?.classList.remove("auth-error");void card?.offsetWidth;card?.classList.add("auth-error")}
    function staffLogin(){
      const btn=$("#staffLoginBtn");
      btn?.classList.add("auth-clicked");
      authMsg("로그인 정보를 확인 중입니다...");
      setLoginButtonState(true,"확인 중");
      const name=$("#staffLoginName")?.value,pin=$("#staffLoginPin")?.value||"",person=(state.people||[]).find(p=>p.name===name);
      if(!name){showLoginError("직원을 선택해주세요.");return}
      if(!person){showLoginError("등록된 직원을 선택해주세요.");return}
      const validPin=staffPin(person)||state.adminPin;
      if(pin!==validPin){showLoginError("PIN이 맞지 않습니다. 관리자에게 개인 PIN을 확인해주세요.");return}
      setTimeout(()=>{setStaffSession(person);$("#googleLogoutBtn")?.classList.remove("hidden");setLoginButtonState(false);showApp()},180);
    }
    async function signOutAuth(msg="로그아웃되었습니다."){clearStaffSession();authUser=null;$("#googleLogoutBtn")?.classList.add("hidden");showAuthGate(msg)}
    async function initAuthGate(){
      ensureDefaultStaffPins();
      fillStaffLoginNames();
      if(acceptStaffSession())return;
      const sess=staffSession();
      if(sess?.name){
        showAuthGate("저장된 로그인으로 최신 업무 데이터를 불러오는 중입니다.");
        try{
          await loadSharedState(true);
          ensureDefaultStaffPins();
          fillStaffLoginNames();
          if(acceptStaffSession())return;
        }catch{}
      }
      showAuthGate("직원 이름과 개인 PIN을 입력해주세요.");
      loadSharedState(true).then(()=>{
        ensureDefaultStaffPins();
        fillStaffLoginNames();
        if(!authReady&&staffSession()?.name)acceptStaffSession();
        if(authReady)render();
      }).catch(()=>{
        ensureDefaultStaffPins();
        fillStaffLoginNames();
      });
      return;
    }
    function clone(v){return JSON.parse(JSON.stringify(v))}
    function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
    function loadState(){const saved=localStorage.getItem(storageKey)||legacyStorageKeys.map(k=>localStorage.getItem(k)).find(Boolean);if(!saved)return clone(defaults);try{return{...clone(defaults),...JSON.parse(saved)}}catch{return clone(defaults)}}
    /* ════════════════════════════════════════════════════════════
       새 데이터 계층: 개별 테이블 (todos/assignments/construction/projects/app_config)
       팀원 6명 동시 사용 → 각 항목을 독립 레코드로 저장하여 충돌 없음
    ════════════════════════════════════════════════════════════ */
    function supabaseHeaders(extra={}){return{apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${SUPABASE_ANON_KEY}`,"Content-Type":"application/json",...extra}}

    /* 테이블 목록: 이 키들은 개별 행으로 저장 (동시 편집 충돌 없음) */
    const TABLE_KEYS=["todos","assignments","construction","projects","meetings","fieldworkLogs","structureInspections"];
    /* Supabase 테이블명 매핑 (JS키 → DB테이블명) */
    const TABLE_NAME={todos:"todos",assignments:"assignments",construction:"construction",projects:"projects",meetings:"meetings",fieldworkLogs:"fieldwork_logs",structureInspections:"structure_inspections"};
    /* 서버에 존재하는 ID 목록 (삭제 감지용) */
    let _svrIds={todos:new Set(),assignments:new Set(),construction:new Set(),projects:new Set(),meetings:new Set(),fieldworkLogs:new Set(),structureInspections:new Set()};
    const svrIdsKey="solar-svr-ids-v1";
    function loadSvrIds(){try{const s=localStorage.getItem(svrIdsKey);if(!s)return;const p=JSON.parse(s);Object.keys(_svrIds).forEach(t=>{if(Array.isArray(p[t]))_svrIds[t]=new Set(p[t]);});}catch{}}
    function saveSvrIds(){try{const o={};Object.keys(_svrIds).forEach(t=>{o[t]=[..._svrIds[t]];});localStorage.setItem(svrIdsKey,JSON.stringify(o));}catch{}}
    /* 최근 삭제된 항목 보호 (60초간): 다른 브라우저의 덮어쓰기로 인한 부활 방지 */
    const _deletedTombstones={};TABLE_KEYS.forEach(t=>_deletedTombstones[t]=new Map());
    const _tombstoneKey="solar-deleted-tombstones-v1";
    const _tombstoneTtl=7*24*60*60*1000;
    function loadTombstones(){try{const s=localStorage.getItem(_tombstoneKey);if(!s)return;const p=JSON.parse(s);const now=Date.now();TABLE_KEYS.forEach(t=>{if(p[t]&&typeof p[t]==="object")Object.entries(p[t]).forEach(([id,ts])=>{if(now-ts<_tombstoneTtl)_deletedTombstones[t].set(id,ts);})});}catch{}}
    function saveTombstones(){try{const o={};TABLE_KEYS.forEach(t=>{const e={};_deletedTombstones[t].forEach((ts,id)=>{e[id]=ts;});o[t]=e;});localStorage.setItem(_tombstoneKey,JSON.stringify(o));}catch{}}
    function markDeleted(table,id){if(id&&_deletedTombstones[table]){_deletedTombstones[table].set(id,Date.now());saveTombstones();}}
    function wasRecentlyDeleted(table,id){const ts=_deletedTombstones[table]?.get(id);return !!ts&&Date.now()-ts<_tombstoneTtl}
    loadTombstones();

    /* 개별 테이블에서 데이터 로드 */
    async function loadSupabaseData(){
      const h=supabaseHeaders();
      const [cfgRes,dbCfgRes,...tableRes]=await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/app_config?id=eq.main&select=data`,{cache:"no-store",headers:h}),
        fetch(`${SUPABASE_URL}/rest/v1/app_config?id=eq.db&select=data`,{cache:"no-store",headers:h}),
        ...TABLE_KEYS.map(t=>fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME[t]||t}?select=id,data&order=updated_at.desc`,{cache:"no-store",headers:h}))
      ]);
      /* 모든 응답 실패 = 연결 불가 */
      if(!cfgRes.ok&&tableRes.every(r=>!r.ok))throw new Error("Supabase 연결 실패");
      const cfgRows=cfgRes.ok?await cfgRes.json():[];
      const dbCfgRows=dbCfgRes.ok?await dbCfgRes.json():[];
      const tableData=await Promise.all(tableRes.map(r=>r.ok?r.json():Promise.resolve([])));
      const config=cfgRows[0]?.data||null;
      /* 새 테이블에 데이터가 있는지 확인 (config는 있어도 업무 데이터가 없으면 마이그레이션 필요) */
      const hasWorkData=tableData.some(rows=>rows.length>0);
      const hasAnyData=hasWorkData; /* config만 있고 업무 데이터 없으면 마이그레이션 필요 */
      if(!hasAnyData){
        /* 구 app_state 테이블에서 마이그레이션 시도 */
        try{
          const legacyRes=await fetch(`${SUPABASE_URL}/rest/v1/app_state?id=eq.main&select=data`,{cache:"no-store",headers:h});
          if(legacyRes.ok){
            const rows=await legacyRes.json();
            if(rows[0]?.data){
              console.log("[마이그레이션] 구 app_state에서 데이터 로드 완료. 새 테이블로 이전 예약됨.");
              return rows[0].data;
            }
          }
        }catch{}
        return config?{...clone(defaults),...config}:null;
      }
      const combined={...clone(defaults),...(config||{})};
      /* 별도 슬롯(id=db)에 저장된 businessDb가 있으면 main config의 것보다 우선 적용 */
      const dbConfig=dbCfgRows[0]?.data||null;
      if(dbConfig&&Array.isArray(dbConfig.rows)&&dbConfig.rows.length)combined.businessDb=dbConfig;
      TABLE_KEYS.forEach((table,i)=>{
        if(!tableRes[i]?.ok){return;} /* 테이블 미존재 또는 오류 → app_config 데이터 유지 */
        const rows=tableData[i]||[];
        combined[table]=rows.map(r=>r.data).filter(Boolean);
        _svrIds[table]=new Set(rows.map(r=>r.id).filter(Boolean));saveSvrIds();
      });
      return combined;
    }

    /* 개별 테이블에 저장 (upsert + delete) */
    async function saveDataToSupabase(data=state,options={}){
      const now=new Date().toISOString();
      const h=supabaseHeaders({Prefer:"resolution=merge-duplicates,return=minimal"});
      /* 1. 설정 데이터 저장 (app_config) - businessDb는 별도 슬롯(id=db)에 저장하므로 제외 */
      const cfgData={};
      Object.keys(data).forEach(k=>{
        if(!TABLE_KEYS.includes(k)&&!k.startsWith("__")&&k!=="businessDb"&&k!=="clockBgImage")cfgData[k]=data[k];
      });
      ["__lastSavedAt","__lastSavedAtText","__deviceId","__updatedAt"].forEach(k=>{if(data[k]!==undefined)cfgData[k]=data[k]});
      const cfgBody=JSON.stringify({id:"main",data:cfgData,updated_at:now});
      /* 2. 각 테이블에 항목 upsert + 삭제된 항목 DELETE */
      const ops=[fetch(`${SUPABASE_URL}/rest/v1/app_config`,{method:"POST",headers:h,body:cfgBody,keepalive:!!options.keepalive})];
      const _pendingIds={};
      for(const table of TABLE_KEYS){
        const items=(data[table]||[]).filter(x=>x&&x.id);
        const currentIds=new Set(items.map(x=>x.id));
        const prevIds=_svrIds[table]||new Set();
        const deletedIds=[...prevIds].filter(id=>!currentIds.has(id));
        const dbTable=TABLE_NAME[table]||table;
        if(items.length){
          ops.push(fetch(`${SUPABASE_URL}/rest/v1/${dbTable}`,{
            method:"POST",headers:h,keepalive:!!options.keepalive,
            body:JSON.stringify(items.map(item=>({id:item.id,data:item,updated_at:now})))
          }));
        }
        if(deletedIds.length){
          ops.push(fetch(`${SUPABASE_URL}/rest/v1/${dbTable}?id=in.(${deletedIds.map(id=>`"${id}"`).join(",")})`,{
            method:"DELETE",headers:supabaseHeaders(),keepalive:!!options.keepalive
          }));
        }
        _pendingIds[table]=currentIds;
      }
      const results=await Promise.all(ops);
      const failed=results.filter(r=>!r.ok);
      if(failed.length){const s=await Promise.all(failed.map(r=>r.status));throw new Error(`저장 실패(${s.join(",")})`);}
      /* 저장 성공 후에만 _svrIds 업데이트 (실패 시 다음 저장에서 다시 DELETE 재시도 가능) */
      Object.assign(_svrIds,_pendingIds);saveSvrIds();
      return true;
    }

    function cleanStateForCloud(source=state){const data=clone(source);delete data.__pendingCloudSync;delete data.__pendingCloudSyncAt;return data}
    async function saveToSupabase(options={}){return saveDataToSupabase(cleanStateForCloud(state),options)}
    function setSyncNotice(kind,msg){const n=$("#sharedNotice");if(!n)return;n.dataset.sync=kind;n.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px"><div><strong>${kind==="ok"?"✅ 팀 동기화 연결됨":kind==="saving"?"💾 저장 중...":"⚠️ 동기화 확인 필요"}</strong><p class="meta" style="margin:2px 0 0">${esc(msg)}</p></div><div style="display:flex;gap:6px;flex-shrink:0"><button class="btn primary" id="forceSheetUploadBtn" type="button">지금 동기화</button><button class="btn" id="checkSheetLoadBtn" type="button">최신 불러오기</button></div></div>`}
    function ensureSheetSyncButton(){if($("#sheetSyncFloatBtn"))return;document.body.insertAdjacentHTML("beforeend",`<button class="btn primary" id="sheetSyncFloatBtn" type="button" title="수동으로 즉시 동기화" style="position:fixed;right:18px;bottom:76px;z-index:9998;box-shadow:0 10px 26px rgba(8,125,143,.28)">지금 동기화</button>`)}
    async function verifySupabaseSave(expectedAt){return true;/* 개별 테이블 저장은 upsert 성공 = 검증 완료 */}
    let syncSaveTimer=null,syncSaveBusy=false,syncSaveQueued=false;
    async function pushSharedState(){if(syncSaveBusy){syncSaveQueued=true;return false}syncSaveBusy=true;try{const expectedAt=new Date().toISOString();state.__lastSavedAt=expectedAt;state.__lastSavedAtText=new Date().toLocaleString("ko-KR");setSyncNotice("saving","수정 내용을 자동으로 Supabase에 저장하는 중입니다.");await saveToSupabase();delete state.__pendingCloudSync;delete state.__pendingCloudSyncAt;localStorage.setItem(storageKey,JSON.stringify(state));const verified=await verifySupabaseSave(expectedAt);setSyncNotice(verified?"ok":"warn",verified?"자동 저장이 완료되었습니다. 다른 컴퓨터에서도 최신 내용을 불러옵니다.":"저장 요청은 보냈지만 Supabase에서 같은 저장시각을 다시 확인하지 못했습니다. 네트워크 또는 권한을 확인해주세요.");return verified}catch(err){state.__pendingCloudSync=true;state.__pendingCloudSyncAt=new Date().toLocaleString("ko-KR");localStorage.setItem(storageKey,JSON.stringify(state));setSyncNotice("warn",`자동 저장 실패: ${err?.message||"확인 필요"} 현재 데이터는 이 브라우저에 대기 저장되었습니다.`);return false}finally{syncSaveBusy=false;if(syncSaveQueued){syncSaveQueued=false;scheduleSharedSave(250)}}}
    function scheduleSharedSave(delay=900){clearTimeout(syncSaveTimer);setSyncNotice("saving","수정 내용이 자동 저장 대기 중입니다.");syncSaveTimer=setTimeout(()=>pushSharedState(),delay)}
    /* ── 5분마다 주기적 자동 저장 ── */
    setInterval(()=>{if(state.__pendingCloudSync||Date.now()-(state.__updatedAt||0)<600000){pushSharedState()}},300000);
    /* refreshFromGoogleSheetsBeforeManualSave: 제거됨 (Google Sheets 비활성화) */
    function persistState(){state.__updatedAt=Date.now();state.__pendingCloudSync=true;state.__deviceId=state.__deviceId||localStorage.getItem("solar-device-id")||uid("device");localStorage.setItem("solar-device-id",state.__deviceId);localStorage.setItem(storageKey,JSON.stringify(state));sharedLoaded=true;scheduleSharedSave();scheduleSheetSync()}
    function saveState(msg="저장되었습니다."){persistState();toast(msg)}

    /* ── JSON 백업 내보내기 ── */
    function exportStateJson(){
      const now=new Date().toLocaleString("ko-KR").replace(/[/:]/g,"-").replace(/\s/g,"_");
      const filename=`업무관리_백업_${now}.json`;
      const json=JSON.stringify({_backupAt:new Date().toISOString(),_version:"v1",state},null,2);
      const blob=new Blob([json],{type:"application/json"});
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download=filename;
      a.click();
      URL.revokeObjectURL(a.href);
      toast(`백업 파일 저장: ${filename}`);
    }
    /* ── JSON 백업 가져오기 ── */
    function importStateJson(file){
      if(!file)return;
      const reader=new FileReader();
      reader.onload=e=>{
        try{
          const parsed=JSON.parse(e.target.result);
          const imported=parsed.state||parsed;
          if(!imported.nav||!imported.todos){toast("올바른 백업 파일이 아닙니다.");return}
          if(!confirm(`백업 파일을 복원하면 현재 데이터가 백업 시점으로 되돌아갑니다.\n백업 시각: ${parsed._backupAt||"알 수 없음"}\n\n계속할까요?`))return;
          Object.assign(state,imported);
          persistState();
          render();
          toast("백업 데이터를 복원했습니다. Supabase에 저장 중...");
          pushSharedState();
        }catch(err){toast("파일을 읽지 못했습니다: "+err.message)}
      };
      reader.readAsText(file);
    }

    // ── Google Sheets Apps Script 코드 모달 ───────────────────────
    function showSheetsScriptModal(){
      if(!$("#sheetsScriptModal")){
        const secret=(state.sheetsSecret||"kiwoom2026").trim()||"kiwoom2026";
        const code=`// ================================================
// 기술지원팀 업무관리 → Google Sheets 자동 동기화
// script.google.com 독립 실행형 / Sheets 바인딩 모두 지원
// ================================================
// [필수] 아래 SECRET을 관리자 설정의 '동기화 키'와 동일하게 입력하세요
const SECRET = '${secret}';

// 스프레드시트 자동 연결 (독립 실행형이면 첫 실행 시 자동 생성)
function getOrCreateSS() {
  try { return SpreadsheetApp.getActiveSpreadsheet(); } catch(e) {}
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SS_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch(e) {} }
  const ss = SpreadsheetApp.create('기술지원팀 업무관리 DB');
  props.setProperty('SS_ID', ss.getId());
  return ss;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return resp({ok:false, msg:'인증 실패'});
    const ss = getOrCreateSS();

    if ((body.todos||[]).length)              syncSheet(ss,'📋할일관리',   todosRows(body));
    if ((body.assignments||[]).length)        syncSheet(ss,'📌업무지시',   assignRows(body));
    if ((body.construction||[]).length)       syncSheet(ss,'🏗시공일정',   constRows(body));
    if ((body.projects||[]).length)           syncSheet(ss,'📁현장목록',   projRows(body));
    if ((body.meetings||[]).length)           syncSheet(ss,'📝회의록',     meetRows(body));
    if ((body.fieldworkLogs||[]).length)      syncSheet(ss,'🚗외근기록',   fieldRows(body));
    if ((body.structureInspections||[]).length) syncSheet(ss,'🔍구조물검수', inspRows(body));

    // 동기화 로그
    let log = ss.getSheetByName('🔄동기화로그') || ss.insertSheet('🔄동기화로그');
    if (log.getLastRow()===0) log.appendRow(['시각','할일','업무','시공','회의록','외근','검수']);
    log.appendRow([new Date(),(body.todos||[]).length,(body.assignments||[]).length,
      (body.construction||[]).length,(body.meetings||[]).length,
      (body.fieldworkLogs||[]).length,(body.structureInspections||[]).length]);
    if (log.getLastRow()>101) log.deleteRows(2, log.getLastRow()-101);

    return resp({ok:true, ts:new Date().toISOString()});
  } catch(err) { return resp({ok:false, msg:err.message}); }
}

function resp(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function syncSheet(ss, name, rows) {
  if (!rows||rows.length<2) return;
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1,1,rows.length,rows[0].length).setValues(rows);
  sh.getRange(1,1,1,rows[0].length)
    .setFontWeight('bold').setBackground('#0d9488').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  try { sh.autoResizeColumns(1, rows[0].length); } catch(e){}
}

function todosRows(b) {
  return [['제목','상태','담당자','우선순위','마감일','구분','시작일','결과','ID'],
    ...(b.todos||[]).map(t=>[t.title||'',t.status||'',t.owner||'',t.priority||'',
      t.due||'',t.type||'',t.start||'',t.result||'',t.id||''])];
}
function assignRows(b) {
  return [['제목','담당자','상태','우선순위','구분','시작일','마감일','현장','결과','ID'],
    ...(b.assignments||[]).map(a=>[a.title||'',a.person||a.owner||'',a.status||'',
      a.priority||'',a.type||'',a.start||'',a.due||'',a.project||'',a.result||'',a.id||''])];
}
function constRows(b) {
  return [['발전소명','시공사','구조물팀','용량(kW)','단계','상태','시작일','완료일','영업','고객','ID'],
    ...(b.construction||[]).map(c=>[c.site||'',c.company||'',c.structureTeam||'',
      c.kw||'',c.phase||'',c.status||'',c.start||'',c.end||'',c.sales||'',c.customer||'',c.id||''])];
}
function projRows(b) {
  return [['현장명','단계','상태','담당자','계약일','완료예정일','주소','비고','ID'],
    ...(b.projects||[]).map(p=>[p.name||'',p.phase||'',p.status||'',
      p.owner||p.manager||'',p.contractDate||'',p.due||'',p.address||'',p.next||'',p.id||''])];
}
function meetRows(b) {
  return [['제목','날짜','시간','주관자','참석자','현장','구분','요약','결정사항','ID'],
    ...(b.meetings||[]).map(m=>[m.title||'',m.date||'',m.time||'',m.host||'',
      (m.attendees||[]).join(', '),m.project||'',m.type||'',m.summary||'',
      (m.decisions||[]).join(' / '),m.id||''])];
}
function fieldRows(b) {
  return [['날짜','시간','담당자','상태','발전소','지역','메모','ID'],
    ...(b.fieldworkLogs||[]).map(f=>[f.date||'',
      String(f.time||'').slice(11,16),f.person||'',f.status||'',
      f.site||'',f.region||'',f.memo||'',f.id||''])];
}
function inspRows(b) {
  return [['발전소명','주소','용량(kW)','외주업체','계약금','검수일','검수자','결과','ID'],
    ...(b.structureInspections||[]).map(i=>[i.plantName||'',i.address||'',
      i.capacity||'',i.contractor||'',i.contractAmount||'',i.date||'',
      i.inspector||'',i.result||'',i.id||''])];
}`;
        document.body.insertAdjacentHTML("beforeend",`<div class="overlay" id="sheetsScriptModal" style="z-index:20"><div class="modal" style="max-width:680px;width:96vw"><div class="modal-head"><h2>📊 Apps Script 코드</h2><div class="row-actions"><button class="btn primary" id="copySheetsScriptBtn">코드 복사</button><button class="btn icon" id="closeSheetsModal">×</button></div></div><div style="background:#0f172a;color:#e2e8f0;border-radius:8px;padding:14px;font-size:11.5px;line-height:1.6;max-height:55vh;overflow:auto;font-family:monospace;white-space:pre" id="sheetsScriptCode"></div><div style="background:#f0fdf8;border:1px solid #a7f3d0;border-radius:8px;padding:10px 12px;margin-top:12px;font-size:12px;color:#065f46;line-height:1.8"><strong>📌 붙여넣기 방법:</strong><br>① script.google.com에서 기존 코드 전체 선택(Ctrl+A) → 삭제 → 위 코드 붙여넣기 (Ctrl+V)<br>② 저장 (Ctrl+S) → 상단 <strong>배포</strong> 버튼 → <strong>새 배포</strong><br>③ 유형: <strong>웹앱</strong> 선택 → 실행: <strong>나(자신으로)</strong> → 액세스: <strong>모든 사용자</strong> → <strong>배포</strong> 클릭<br>④ 나오는 URL 복사 → 이 앱 관리자 설정 &gt; <strong>Sheets URL</strong> 붙여넣기 → 저장<br><span style="color:#059669">✅ 스프레드시트는 첫 동기화 시 자동으로 생성됩니다 (내 구글 드라이브에 저장)</span></div></div></div>`);
        document.getElementById("sheetsScriptCode").textContent=code;
      }
      $("#sheetsScriptModal").classList.add("open");
    }
    // ── Google Sheets 자동 동기화 ──────────────────────────────────
    let _sheetSyncTimer=null;
    function scheduleSheetSync(){
      clearTimeout(_sheetSyncTimer);
      _sheetSyncTimer=setTimeout(()=>syncToGoogleSheets(),5000); // 5초 debounce
    }
    async function syncToGoogleSheets(showResult=false){
      const url=(state.sheetsUrl||"").trim();
      const secret=(state.sheetsSecret||"").trim();
      if(!url||!secret)return;
      try{
        const payload={
          secret,
          ts:new Date().toISOString(),
          todos:state.todos||[],
          assignments:state.assignments||[],
          construction:state.construction||[],
          projects:state.projects||[],
          meetings:state.meetings||[],
          fieldworkLogs:state.fieldworkLogs||[],
          structureInspections:state.structureInspections||[],
          people:state.people||[]
        };
        const res=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
        if(showResult){
          const txt=await res.text().catch(()=>"(응답 없음)");
          toast("📊 응답: "+res.status+" / "+txt.slice(0,80));
        }
      }catch(e){
        if(showResult)toast("❌ 오류: "+(e.message||e));
        /* silent fail otherwise */
      }
    }
    // ─────────────────────────────────────────────────────────────
    /* 삭제 전용: 즉시 동기화 (300ms 후) → 다른 브라우저가 바로 삭제 확인 */
    function deleteAndSync(msg="삭제됐습니다."){
      state.__updatedAt=Date.now();
      state.__pendingCloudSync=true;
      state.__deviceId=state.__deviceId||localStorage.getItem("solar-device-id")||uid("device");
      localStorage.setItem("solar-device-id",state.__deviceId);
      localStorage.setItem(storageKey,JSON.stringify(state));
      sharedLoaded=true;
      toast(msg);
      /* 지연 없이 즉시 동기화 (삭제는 빠른 전파 필요) */
      clearTimeout(syncSaveTimer);
      syncSaveTimer=setTimeout(()=>pushSharedState(),300);
    }
    function saveStateAfterPaint(msg="저장되었습니다."){state.__updatedAt=Date.now();state.__pendingCloudSync=true;state.__pendingCloudSyncAt=new Date().toLocaleString("ko-KR");state.__deviceId=state.__deviceId||localStorage.getItem("solar-device-id")||uid("device");localStorage.setItem("solar-device-id",state.__deviceId);localStorage.setItem(storageKey,JSON.stringify(state));sharedLoaded=true;const run=()=>{scheduleSharedSave(80);toast(msg)};if("requestIdleCallback" in window)requestIdleCallback(run,{timeout:900});else setTimeout(run,40)}
    const syncWorkKeys=["todos","assignments","construction","projects","fieldworkLogs","meetings","messages","messageInbox","genericReports","asReports"];
    function arrayCount(v){return Array.isArray(v)?v.length:0}
    function dbWorkCount(data){return arrayCount(data?.dbRows)+arrayCount(data?.db?.rows)+arrayCount(data?.businessDb?.rows)+arrayCount(data?.epcData?.plants)}
    function hasUsefulWorkData(data){return workDataCount(data)>0}
    function workDataCount(data){return syncWorkKeys.reduce((sum,k)=>sum+arrayCount(data?.[k]),0)+dbWorkCount(data)}
    function syncStamp(data){return Math.max(Number(data?.__updatedAt)||0,Date.parse(data?.__lastSavedAt||"")||0,Date.parse(data?.updated_at||"")||0)}
    /* ── 동기화 판단: 서버 데이터를 가져올지 결정 ── */
    function shouldUseSharedState(shared,forceRemote=false){
      if(!shared)return false;
      if(forceRemote)return true; /* 수동 "최신 불러오기" → 무조건 서버 */
      const sharedHas=workDataCount(shared)>0,localHas=workDataCount(state)>0;
      /* 최초 로드: 서버에 데이터 있으면 가져옴 */
      if(!sharedLoaded)return sharedHas;
      /* 폴링: 서버가 더 최신이거나 다른 기기 저장이면 병합 적용
         (pending 저장 중이면 내 변경 보호: 완료 후 다음 폴링에서 처리) */
      if(state.__pendingCloudSync)return false;
      const sharedStamp=syncStamp(shared),localStamp=syncStamp(state);
      /* 서버가 내 마지막 저장보다 더 최신 = 다른 팀원이 저장했음 */
      return sharedStamp>localStamp;
    }
    /* ── 병합: 서버에 없는 로컬 항목 중 진짜 새 항목만 추가 (삭제된 항목 부활 방지) ── */
    function mergeLocalItems(sharedArr,localArr,table){
      if(!Array.isArray(localArr)||!localArr.length)return sharedArr||[];
      if(!Array.isArray(sharedArr)||!sharedArr.length)return localArr;
      const sharedIds=new Set(sharedArr.map(x=>x.id).filter(Boolean));
      /* 이전 서버 상태: 여기에 있었는데 지금 서버에 없으면 → 다른 기기가 삭제한 것 */
      const prevServerIds=_svrIds[table]||new Set();
      const localOnly=localArr.filter(x=>{
        if(!x.id)return false;
        if(sharedIds.has(x.id))return false; /* 서버에 있음 */
        if(prevServerIds.has(x.id))return false; /* 이전에 서버에 있었음 → 삭제된 것 */
        return true; /* 진짜 새로 추가된 로컬 항목만 */
      });
      return localOnly.length?[...localOnly,...sharedArr]:sharedArr;
    }
    function applySharedState(shared,forceReplace=false){
      /* 첫 로드 시 _svrIds가 비어있으면 타임스탬프 무관하게 로컬 병합을 건너뜀
         (스마트폰 등 오래된 캐시가 클라우드 데이터를 오염시키는 버그 방지) */
      const isFirstLoad=!sharedLoaded;
      const svrIdsEmpty=Object.values(_svrIds).every(s=>s.size===0);
      if(isFirstLoad&&svrIdsEmpty)forceReplace=true;
      sharedLoaded=true;
      /* TABLE_KEYS 밖이지만 폴링 때 덮어써지면 안 되는 로컬 보호 키 */
      const _localProtectKeys=["siteInspections","allocation"];
      const _localProtect={};
      _localProtectKeys.forEach(k=>{if(state[k]!==undefined)_localProtect[k]=clone(state[k])});
      const _localUpdatedAt=state.__updatedAt||0;
      const merged={...clone(defaults),...shared};
      let hadLocalOnly=false;
      if(!forceReplace){
        /* 병합: 진짜 새 로컬 항목만 추가 (삭제된 항목은 부활 안 함) */
        for(const key of (TABLE_KEYS||syncWorkKeys)){
          if(Array.isArray(state[key])&&Array.isArray(merged[key])){
            const before=merged[key].length;
            merged[key]=mergeLocalItems(merged[key],state[key],key); /* table 정보 전달 */
            if(merged[key].length>before)hadLocalOnly=true;
          }
        }
      }
      /* 최근 삭제된 항목이 서버 데이터에 포함되어 있어도 부활 방지 */
      TABLE_KEYS.forEach(t=>{if(Array.isArray(merged[t]))merged[t]=merged[t].filter(item=>!wasRecentlyDeleted(t,item.id));});
      state=merged;
      /* TABLE_KEYS 밖 보호 키(siteInspections, allocation): 폴링 때마다 덮어써지는 버그 방지 — 로컬이 더 최신이면 유지 */
      if(!forceReplace&&_localUpdatedAt>(shared.__updatedAt||0)){
        Object.keys(_localProtect).forEach(k=>{state[k]=_localProtect[k]});
      }
      /* _svrIds 업데이트 (서버 기준 ID 동기화) */
      if(TABLE_KEYS)(TABLE_KEYS).forEach(t=>{if(Array.isArray(state[t]))_svrIds[t]=new Set(state[t].map(x=>x.id).filter(Boolean))});saveSvrIds();
      localStorage.setItem(storageKey,JSON.stringify(state));
      setSyncNotice("ok",hadLocalOnly?"내 변경사항과 팀원 데이터를 병합했습니다.":"✅ 팀원의 최신 데이터를 불러왔습니다.");
      render();
      /* 로컬 항목이 있었으면 병합 결과를 즉시 서버에 올려 다른 팀원도 볼 수 있게 함 */
      if(hadLocalOnly)scheduleSharedSave(500);
    }
    async function loadSharedState(silent=false,forceRemote=false){
      if(!silent)setSyncNotice("saving","Supabase 저장소에서 최신 데이터를 확인하는 중입니다.");
      try{
        let shared=await loadSupabaseData();
        if(shared&&Number(shared.__presenceUpdatedAt||0)>Number(state.__presenceUpdatedAt||0)){
          state.onlineUsers=Array.isArray(shared.onlineUsers)?shared.onlineUsers:[];
          state.__presenceUpdatedAt=shared.__presenceUpdatedAt;
          localStorage.setItem(storageKey,JSON.stringify(state));
          window.renderPresenceUi?.();
        }
        /* forceRemote=수동 불러오기 버튼 → 서버 데이터로 완전 교체 / 자동=항상 병합 */
        if(shouldUseSharedState(shared,forceRemote))applySharedState(shared,!!forceRemote);
        else {sharedLoaded=true;if(!silent)setSyncNotice("ok",hasUsefulWorkData(state)?"현재 브라우저의 저장 데이터를 사용합니다.":"저장된 업무 데이터가 없습니다.");}
        return;
      }catch(err){
        try{
          const r=await fetch("/api/state",{cache:"no-store"}),shared=await r.json();
          if(shouldUseSharedState(shared))applySharedState(shared,true);
          else {sharedLoaded=true;if(!silent)setSyncNotice("warn","현재 브라우저에 저장된 데이터만 표시 중입니다.")}
        }catch{
          sharedLoaded=true;
          if(!silent)setSyncNotice("warn","현재 브라우저에 저장된 데이터만 표시 중입니다.");
        }
      }
    }
    function toast(msg){els.toast.textContent=msg;els.toast.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>els.toast.classList.remove("show"),1500)}
    function ensureUpdateNotice(){
      if($("#appUpdateNotice"))return $("#appUpdateNotice");
      document.head.insertAdjacentHTML("beforeend",`<style id="appUpdateNoticeStyle">.app-update-notice{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;width:min(560px,calc(100vw - 28px));display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;border:1px solid #b8d8de;border-radius:8px;background:#fff;box-shadow:0 16px 42px rgba(19,35,42,.22);padding:12px 14px}.app-update-notice strong{font-size:14px}.app-update-notice span{display:block;color:var(--muted);font-size:12px;margin-top:2px}.app-update-notice.hidden{display:none}@media(max-width:620px){.app-update-notice{grid-template-columns:1fr}.app-update-notice .btn{width:100%}}#sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
      document.body.insertAdjacentHTML("beforeend",`<div class="app-update-notice hidden" id="appUpdateNotice"><div><strong>새 버전이 있습니다.</strong><span>최신 기능을 사용하려면 새로고침하세요.</span></div><button class="btn primary" id="reloadLatestBtn" type="button">새로고침</button><button class="btn" id="dismissUpdateBtn" type="button">나중에</button></div>`);
      return $("#appUpdateNotice");
    }
    function showUpdateNotice(version){const n=ensureUpdateNotice();n.dataset.latestVersion=version||"";n.classList.remove("hidden")}
    function latestVersionUrl(version){const u=new URL(location.href);u.searchParams.set("v",version||Date.now());u.searchParams.delete("version-check");return u.toString()}
    async function checkAppVersion(){
      if(location.protocol==="file:")return;
      try{
        const url=`${location.origin}${location.pathname}?version-check=${Date.now()}`;
        const r=await fetch(url,{cache:"no-store"});
        if(!r.ok)return;
        const html=await r.text(),m=html.match(/appBuildVersion="([^"]+)"/);
        const latest=m?.[1]||"";
        if(latest&&latest!==appBuildVersion){
          const reloadKey=`auto-reloaded-${latest}`;
          if(sessionStorage.getItem(reloadKey)!=="1"){sessionStorage.setItem(reloadKey,"1");location.replace(latestVersionUrl(latest));return}
          if(localStorage.getItem("dismissed-app-version")!==latest)showUpdateNotice(latest);
        }
      }catch{}
    }
    function uid(prefix){return prefix+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}
    function assignmentToTodoStatus(a){if(a.status==="완료")return"완료";if(a.status==="보류")return"백로그";if(a.status==="진행"||a.status==="검토요청")return"진행중";return"할 일"}
    function todoToAssignmentStatus(t){if(t.status==="완료")return"완료";if(t.status==="취소")return"보류";if(t.status==="진행중")return"진행";return"지시"}
    function normalizeAssignment(a){if(!a.id)a.id=uid("assignment");if(!a.start)a.start=a.due||today;if(!a.due)a.due=a.start||today;if(!a.priority)a.priority="보통";if(!a.status)a.status="지시";if(!a.type)a.type="일반업무";if(!a.project)a.project="일반업무";if(!a.title)a.title="제목 없는 일정";return a}
    function normalizeTodo(t){if(!t.id)t.id=uid("todo");if(!t.status)t.status=t.badge||"할 일";if(!t.owner)t.owner=state.people[0]?.name||"";if(!t.priority)t.priority="보통";if(!t.due)t.due=t.date||today;if(!t.title)t.title="제목 없는 할일";return t}
    function assignmentToTodo(a,old={}){return{...old,id:a.linkedTodoId||old.id||uid("todo"),linkedAssignmentId:a.id,title:a.title,owner:a.owner,status:assignmentToTodoStatus(a),priority:a.priority,due:a.due,detail:a.detail||a.result||"",project:a.project,type:a.type,start:a.start,startTime:a.startTime,endTime:a.endTime,allDay:a.allDay,repeat:a.repeat,location:a.location}}
    function todoToAssignment(t,old={}){return{...old,id:t.linkedAssignmentId||old.id||uid("assignment"),linkedTodoId:t.id,owner:t.owner,project:t.project||"일반업무",priority:t.priority,status:todoToAssignmentStatus(t),start:t.start||t.due||today,due:t.due||today,startTime:t.startTime||"09:00",endTime:t.endTime||"10:00",allDay:!!t.allDay,repeat:t.repeat||"반복 없음",location:t.location||"",type:t.type||"일반업무",title:t.title,detail:t.detail||"",result:t.result||""}}
    function ensureTaskLinks(){
  /* ID 및 기본값만 정규화 — 자동 생성은 하지 않음 (삭제한 항목 부활 버그 방지) */
  state.assignments.forEach(a=>normalizeAssignment(a));
  state.todos.forEach(t=>normalizeTodo(t));
  /* 기존 항목끼리만 연결 (없으면 새로 만들지 않음) */
  state.assignments.forEach(a=>{
    if(!a.linkedTodoId){
      const match=state.todos.find(t=>!t.linkedAssignmentId&&t.title===a.title&&t.owner===a.owner&&t.due===a.due);
      if(match){normalizeTodo(match);a.linkedTodoId=match.id;match.linkedAssignmentId=a.id}
      /* ← 이전 코드: else{ state.todos.unshift(assignmentToTodo(a)) } → 삭제한 할일 부활 원인이었음 */
    }
  });
  state.todos.forEach(t=>{
    if(!t.linkedAssignmentId){
      const match=state.assignments.find(a=>!a.linkedTodoId&&a.title===t.title&&a.owner===t.owner&&a.due===t.due);
      if(match){normalizeAssignment(match);t.linkedAssignmentId=match.id;match.linkedTodoId=t.id}
      /* ← 이전 코드: else{ state.assignments.unshift(todoToAssignment(t)) } → 삭제한 일정 부활 원인이었음 */
    }
  });
}
    function syncAssignmentToTodo(i){const a=normalizeAssignment(state.assignments[i]);let ti=state.todos.findIndex(t=>t.id===a.linkedTodoId||t.linkedAssignmentId===a.id);if(ti<0){const t=assignmentToTodo(a);a.linkedTodoId=t.id;state.todos.unshift(t)}else{const t=assignmentToTodo(a,state.todos[ti]);a.linkedTodoId=t.id;state.todos[ti]=t}}
    function syncTodoToAssignment(i){const t=normalizeTodo(state.todos[i]);let ai=state.assignments.findIndex(a=>a.id===t.linkedAssignmentId||a.linkedTodoId===t.id);if(ai<0){const a=todoToAssignment(t);t.linkedAssignmentId=a.id;state.assignments.unshift(a)}else{const a=todoToAssignment(t,state.assignments[ai]);t.linkedAssignmentId=a.id;state.assignments[ai]=a}}
    function deleteAssignmentAt(i){const a=state.assignments[i];if(!a)return;markDeleted("assignments",a.id);if(a.linkedTodoId)markDeleted("todos",a.linkedTodoId);state.assignments.splice(i,1);if(a.linkedTodoId)state.todos=state.todos.filter(t=>t.id!==a.linkedTodoId)}
    function deleteTodoAt(i){const t=state.todos[i];if(!t)return;markDeleted("todos",t.id);if(t.linkedAssignmentId)markDeleted("assignments",t.linkedAssignmentId);state.todos.splice(i,1);if(t.linkedAssignmentId)state.assignments=state.assignments.filter(a=>a.id!==t.linkedAssignmentId)}
    function syncAllTaskLinks(){state.assignments.forEach((_,i)=>syncAssignmentToTodo(i));state.todos.forEach((_,i)=>syncTodoToAssignment(i))}
    function hiddenNavLabels(){state.hiddenNavLabels=Array.isArray(state.hiddenNavLabels)?[...new Set(state.hiddenNavLabels.filter(Boolean))]:[];return state.hiddenNavLabels}
    function isNavHidden(label){return hiddenNavLabels().includes(label)}
    function hideNavLabel(label){if(label&&!isNavHidden(label))state.hiddenNavLabels.push(label)}
    function showNavLabel(label){state.hiddenNavLabels=hiddenNavLabels().filter(x=>x!==label)}
    normalizeState=function(){state={...clone(defaults),...state};["people","projects","construction","assignments","todos"].forEach(k=>state[k]=state[k]||[]);state.nav=(state.nav||defaults.nav).map(n=>({...n,label:n.label==="\uC9C1\uC6D0\uC5C5\uBB34"?"\uC77C\uC815\uAD00\uB9AC":n.label}));if(!state.nav.some(n=>n.label==="\uD560\uC77C\uAD00\uB9AC")){const adminIndex=state.nav.findIndex(n=>n.label.includes("\uAD00\uB9AC\uC790")),insertAt=adminIndex>=0?adminIndex:state.nav.length;state.nav.splice(insertAt,0,{icon:"?",label:"\uD560\uC77C\uAD00\uB9AC"})}state.construction.forEach(c=>{if(!c.structureTeam)c.structureTeam=state.structureTeams[0]||""});state.assignments.forEach(a=>normalizeAssignment(a));state.todos.forEach(t=>normalizeTodo(t));ensureTaskLinks()};assignmentToTodoStatus=function(a){if(a.status==="\uC644\uB8CC")return"\uC644\uB8CC";if(a.status==="\uBCF4\uB958")return"\uBC31\uB85C\uADF8";if(a.status==="\uC9C4\uD589"||a.status==="\uAC80\uD1A0\uC694\uCCAD")return"\uC9C4\uD589\uC911";return"\uD560 \uC77C"};todoToAssignmentStatus=function(t){if(t.status==="\uC644\uB8CC")return"\uC644\uB8CC";if(t.status==="\uCDE8\uC18C")return"\uBCF4\uB958";if(t.status==="\uC9C4\uD589\uC911")return"\uC9C4\uD589";return"\uC9C0\uC2DC"};normalizeAssignment=function(a){if(!a.id)a.id=uid("assignment");if(!a.start)a.start=a.due||today;if(!a.due)a.due=a.start||today;if(!a.priority)a.priority="\uBCF4\uD1B5";if(!a.status)a.status="\uC9C0\uC2DC";if(!a.type)a.type="\uC77C\uBC18\uC5C5\uBB34";if(!a.project)a.project="\uC77C\uBC18\uC5C5\uBB34";if(!a.title)a.title="\uC81C\uBAA9 \uC5C6\uB294 \uC77C\uC815";return a};normalizeTodo=function(t){if(!t.id)t.id=uid("todo");if(!t.status)t.status=t.badge||"\uD560 \uC77C";if(!t.owner)t.owner=state.people[0]?.name||"";if(!t.priority)t.priority="\uBCF4\uD1B5";if(!t.due)t.due=t.date||today;if(!t.title)t.title="\uC81C\uBAA9 \uC5C6\uB294 \uD560\uC77C";return t};function unlockAdmin(){if(adminUnlocked)return true;const pin=prompt("관리자 PIN을 입력하세요.");if(pin===state.adminPin){adminUnlocked=true;sessionStorage.setItem("solar-admin-unlocked","true");toast("관리자 권한이 확인되었습니다.");return true}if(pin!==null)toast("관리자 PIN이 맞지 않습니다.");return false}function phaseForMenu(label){if(label.includes("고객")||label.includes("계약"))return"고객상담";if(label.includes("현장"))return"현장조사";if(label.includes("설계")||label.includes("자재"))return"자재발주";if(label.includes("시공"))return"시공중";return"전체"}function viewForLabel(label){if(label.includes("대시보드"))return"dashboard";if(label.includes("관리자"))return"admin";if(label.includes("할일관리"))return"todos";if(label.includes("직원업무")||label.includes("일정관리"))return"assignments";if(label.includes("시공일정"))return"construction";return"projects"}function statusClass(t){if((t||"").includes("지연")||(t||"").includes("보완")||(t||"").includes("긴급"))return"red";if((t||"").includes("대기")||(t||"").includes("예정"))return"amber";if((t||"").includes("진행")||(t||"").includes("시공중"))return"blue";return"green"}function priorityClass(p){return p==="긴급"?"red":p==="높음"?"amber":p==="보통"?"blue":"green"}function pulseTopButton(t,msg=""){if(!t)return;t.classList.remove("top-click-pop");void t.offsetWidth;t.classList.add("top-click-pop");setTimeout(()=>t.classList.remove("top-click-pop"),360);if(msg)toast(msg)}function updateTopButtons(){$("#adminTopBtn")?.classList.toggle("is-active",currentView==="admin");$("#maskToggleBtn")?.classList.toggle("is-active",maskingMode);$$("header .toolbar button").forEach(b=>{if(b.id==="exportBtn"||b.textContent.includes("내보내기"))b.classList.add("hidden")});const adminExport=$("#adminView #exportBtn");if(adminExport)adminExport.classList.toggle("hidden",currentView!=="admin")}
    function renderLoginInfo(){const box=$("#loginInfo");if(!box)return;const name=loginName(),person=(state.people||[]).find(p=>p.name===name);box.classList.toggle("admin",adminUnlocked);box.innerHTML=name?`${esc(name)}<span class="role">${esc(person?.role||"직원")} · ${adminUnlocked?"관리자 권한":"직원 로그인"}</span>`:"로그인 확인 중"}
    const baseUpdateTopButtons=updateTopButtons;
    updateTopButtons=function(){baseUpdateTopButtons();renderLoginInfo()}
    unlockAdmin=function(){const owner=loginName();if(adminUnlocked&&sessionStorage.getItem(adminOwnerKey)===owner)return true;adminUnlocked=false;sessionStorage.removeItem(adminUnlockKey);sessionStorage.removeItem(adminOwnerKey);const pin=prompt("관리자 PIN을 입력하세요.");if(pin===state.adminPin){adminUnlocked=true;sessionStorage.setItem(adminUnlockKey,"true");sessionStorage.setItem(adminOwnerKey,owner);toast("관리자 권한이 확인되었습니다.");updateTopButtons();return true}if(pin!==null)toast("관리자 PIN이 맞지 않습니다.");return false}
    function render(){normalizeState();updateTopButtons();els.brandName.textContent=state.brand;els.pageTitle.textContent=currentView==="assignments"?"일정관리":currentView==="todos"?"할일관리":state.title;els.pageSub.textContent=currentView==="assignments"?"회의는 짧게, 성과는 길게 가면 좋겠습니다.":currentView==="todos"?"작게 쪼개면 일도 덜 무서워 보입니다.":state.subtitle;$("#addProjectBtn").textContent=currentView==="assignments"?"일정 등록":currentView==="todos"?"할일 추가":"신규 현장";renderNav();renderFilters();renderKpiFilters();renderCalendarFilters();renderAssignmentCalendarFilters();renderConstructionReportFilters();renderView();renderCurrentContent();renderKpis();updateTopButtons()}function renderNav(){els.nav.innerHTML=state.nav.map((n,i)=>`<button class="nav-btn ${isActive(n.label)?"active":""}" data-nav="${i}"><span>${esc(n.icon)}</span><span>${esc(n.label)}</span></button>`).join("")}function isActive(label){if(currentView==="dashboard")return label.includes("대시보드");if(currentView==="admin")return label.includes("관리자");if(currentView==="todos")return label.includes("할일관리");if(currentView==="assignments")return label.includes("직원업무")||label.includes("일정관리");if(currentView==="construction")return label.includes("시공일정");return phaseForMenu(label)!=="전체"&&els.phaseFilter.value===phaseForMenu(label)}function protectedView(view,label=""){return view==="construction"||view==="db"||view==="drive"||label.includes("시공일정")||label.includes("DB")||label.includes("프로젝트 파일")}function goToView(view,label=""){currentView=view;localStorage.setItem(viewStorageKey,view);renderFilters();if(label){const p=phaseForMenu(label);els.phaseFilter.value=view==="construction"?"전체":state.phases.includes(p)?p:"전체"}renderNav();renderView();renderCurrentContent();renderKpis();updateTopButtons()}function renderView(){$("#kpis").classList.toggle("hidden",currentView==="assignments"||currentView==="todos");document.body.classList.toggle("schedule-page",currentView==="assignments");document.body.classList.toggle("todo-page",currentView==="todos");els.dashboardView.classList.toggle("hidden",currentView!=="dashboard");els.adminView.classList.toggle("hidden",currentView!=="admin");els.mainGrid.classList.toggle("hidden",currentView==="dashboard"||currentView==="admin");els.mainGrid.classList.toggle("schedule-mode",currentView==="assignments");els.mainGrid.classList.toggle("todo-mode",currentView==="todos");els.mainGrid.classList.toggle("construction-mode",currentView==="construction");renderEmployeePanels()}function renderEmployeePanels(){const emp=currentView==="assignments",con=currentView==="construction",todo=currentView==="todos";els.employeeTabs.classList.toggle("hidden",!emp);els.assignmentsPanel.classList.toggle("hidden",!emp||employeeSubView!=="assignments");els.peoplePanel.classList.toggle("hidden",!emp||employeeSubView!=="workload");els.employeeKpiPanel.classList.toggle("hidden",!emp||employeeSubView!=="kpi");els.todosPanel.classList.toggle("hidden",emp||con||todo);els.constructionReportPanel.classList.toggle("hidden",!con);els.currentPlantsPanel.classList.toggle("hidden",!con);els.upcomingPlantsPanel.classList.toggle("hidden",!con);$$("[data-employee-tab]").forEach(b=>b.classList.toggle("active",b.dataset.employeeTab===employeeSubView))}
    function renderFilters(){const phases=currentView==="construction"?state.constructionPhases:state.phases;els.phaseFilter.innerHTML=`<option value="전체">전체 단계</option>`+phases.map(p=>`<option>${esc(p)}</option>`).join("");$("#projectPhase").innerHTML=state.phases.map(p=>`<option>${esc(p)}</option>`).join("");$("#projectStatus").innerHTML=state.statuses.map(s=>`<option>${esc(s)}</option>`).join("");$("#assignmentOwner").innerHTML=state.people.map(p=>`<option>${esc(p.name)}</option>`).join("");$("#assignmentProject").innerHTML=(state.projects.length?state.projects:[{name:"일반업무"}]).map(p=>`<option>${esc(p.name)}</option>`).join("");$("#assignmentStatus").innerHTML=state.assignmentStatuses.map(s=>`<option>${esc(s)}</option>`).join("");$("#constructionCompany").innerHTML=state.constructionTeams.map(t=>`<option>${esc(t)}</option>`).join("");$("#constructionStructureTeam").innerHTML=state.structureTeams.map(t=>`<option>${esc(t)}</option>`).join("");$("#constructionPhase").innerHTML=state.constructionPhases.map(p=>`<option>${esc(p)}</option>`).join("")}
    function durationDays(start,end){if(!start||!end)return 0;const s=new Date(start),e=new Date(end);if(Number.isNaN(s.getTime())||Number.isNaN(e.getTime())||e<s)return 0;return Math.round((e-s)/86400000)+1}function completionMonth(end){return end&&/^\d{4}-\d{2}/.test(end)?end.slice(0,7):""}function filterValue(view,key){return columnFilters[view]?.[key]||""}function sortLabel(view,key,label){const s=sortState[view],mark=s.key===key?`<span class="sort-mark">${s.dir==="asc"?"▲":"▼"}</span>`:"";return `<button class="sort-head" data-sort-view="${view}" data-sort-key="${key}">${esc(label)}${mark}</button>`}function columnFilter(view,key,label){return `<input class="column-filter" data-column-view="${view}" data-column-filter="${key}" value="${esc(filterValue(view,key))}" placeholder="${esc(label)}">`}function renderHead(view,cols){els.tableHead.innerHTML=`<tr>${cols.map(c=>`<th ${c.style?`style="${c.style}"`:""}>${c.key?sortLabel(view,c.key,c.label):esc(c.label)}</th>`).join("")}</tr><tr class="filter-row">${cols.map(c=>c.key?`<th>${columnFilter(view,c.key,c.label)}</th>`:"<th></th>").join("")}</tr>`}function matchesColumnFilters(view,row){return Object.entries(columnFilters[view]||{}).every(([k,v])=>!v||String(row[k]??"").toLowerCase().includes(v.toLowerCase()))}function sortRows(view,rows,rowFn,prop){const s=sortState[view];if(!s.key)return rows;return rows.slice().sort((a,b)=>{const av=rowFn(a[prop])[s.key],bv=rowFn(b[prop])[s.key],as=String(av??""),bs=String(bv??""),num=/^-?\d+(\.\d+)?$/.test(as)&&/^-?\d+(\.\d+)?$/.test(bs);let r=num?Number(as)-Number(bs):as.localeCompare(bs,"ko",{numeric:true});return s.dir==="asc"?r:-r})}
    function projectFilter(p){return{name:p.name,phase:p.phase,owner:p.owner,due:p.due,status:p.status,next:p.next}}function assignmentFilter(a){return{owner:a.owner,type:a.type,title:a.title,priority:a.priority,start:a.start,due:a.due,status:a.status}}function assignmentPriorityOptions(v){return["보통","높음","긴급","낮음"].map(x=>`<option ${x===v?"selected":""}>${esc(x)}</option>`).join("")}function assignmentStatusOptions(v){return state.assignmentStatuses.map(x=>`<option ${x===v?"selected":""}>${esc(x)}</option>`).join("")}function constructionFilter(c){return{company:c.company,structureTeam:c.structureTeam||"",site:c.site,kw:c.kw,sales:c.sales,customer:c.customer,phase:c.phase,owner:c.owner,start:c.start,end:c.end,duration:durationDays(c.start,c.end),completionMonth:completionMonth(c.end),status:c.status,next:c.next}}function renderProjectHead(){renderHead("projects",[{key:"name",label:"고객/현장",style:"width:18%"},{key:"phase",label:"업무단계",style:"width:13%"},{key:"owner",label:"담당",style:"width:12%"},{key:"due",label:"마감일",style:"width:13%"},{key:"status",label:"상태",style:"width:13%"},{key:"next",label:"다음 액션",style:"width:23%"},{label:"관리",style:"width:8%"}])}function renderAssignmentHead(){renderHead("assignments",[{key:"owner",label:"담당",style:"width:12%"},{key:"type",label:"구분",style:"width:11%"},{key:"title",label:"지시 제목",style:"width:22%"},{key:"priority",label:"우선",style:"width:10%"},{key:"start",label:"시작일",style:"width:12%"},{key:"due",label:"마감일",style:"width:12%"},{key:"status",label:"상태",style:"width:11%"},{label:"관리",style:"width:10%"}])}function renderConstructionHead(){renderHead("construction",[{key:"company",label:"시공사"},{key:"structureTeam",label:"구조물팀"},{key:"site",label:"현장"},{key:"kw",label:"kW"},{key:"sales",label:"영업자"},{key:"customer",label:"고객"},{key:"phase",label:"업무단계"},{key:"owner",label:"담당"},{key:"start",label:"시작일"},{key:"end",label:"완료일"},{key:"duration",label:"소요일"},{key:"completionMonth",label:"완료월"},{key:"status",label:"상태"},{key:"next",label:"다음 액션"},{label:"관리"}])}function renderWorkTable(){currentView==="assignments"?renderAssignmentRows():currentView==="construction"?renderConstructionRows():renderProjectRows()}
    function renderProjectRows(){els.dbPasteBtn.classList.add("hidden");els.undoDbImportBtn.classList.add("hidden");els.rows.closest("table").style.minWidth="";els.tableTitle.textContent="현장·공무 진행표";$("#addContentBtn").textContent="현장 추가";renderProjectHead();const q=els.search.value.trim(),ph=els.phaseFilter.value||"전체";const rows=sortRows("projects",state.projects.map((p,i)=>({p,i})).filter(({p})=>(ph==="전체"||p.phase===ph)&&Object.values(p).join(" ").includes(q)&&matchesColumnFilters("projects",projectFilter(p))),projectFilter,"p");els.rows.innerHTML=rows.map(({p,i})=>`<tr><td>${esc(p.name)}</td><td>${esc(p.phase)}</td><td>${esc(p.owner)}</td><td>${esc(p.due)}</td><td><span class="badge ${statusClass(p.status)}">${esc(p.status)}</span></td><td>${esc(p.next)}</td><td><button class="btn icon" data-edit-project="${i}">✎</button></td></tr>`).join("")}
    function renderConstructionRows(){els.dbPasteBtn.classList.remove("hidden");els.undoDbImportBtn.classList.toggle("hidden",!state.lastDbImportBackup);els.rows.closest("table").style.minWidth="1660px";els.tableTitle.textContent="시공일정관리";$("#addContentBtn").textContent="시공일정 추가";renderConstructionHead();const q=els.search.value.trim(),ph=els.phaseFilter.value||"전체";const rows=sortRows("construction",state.construction.map((c,i)=>({c,i})).filter(({c})=>(ph==="전체"||c.phase===ph)&&Object.values(c).join(" ").includes(q)&&matchesColumnFilters("construction",constructionFilter(c))),constructionFilter,"c");els.rows.innerHTML=rows.map(({c,i})=>`<tr><td>${esc(c.company)}</td><td>${esc(c.structureTeam||"")}</td><td><button class="cell-link" data-edit-construction="${i}" type="button">${esc(c.site)}</button></td><td>${esc(c.kw)}</td><td>${esc(c.sales)}</td><td>${esc(c.customer)}</td><td>${esc(c.phase)}</td><td>${esc(c.owner)}</td><td>${esc(c.start)}</td><td>${esc(c.end)}</td><td>${durationDays(c.start,c.end)}일</td><td>${esc(completionMonth(c.end))}</td><td><span class="badge ${statusClass(c.status)}">${esc(c.status)}</span></td><td>${esc(c.next)}</td><td><button class="btn icon" data-edit-construction="${i}">✎</button></td></tr>`).join("")}
    function renderAssignmentRows(){els.dbPasteBtn.classList.add("hidden");els.undoDbImportBtn.classList.add("hidden");els.rows.closest("table").style.minWidth="980px";els.tableTitle.textContent="직원 업무지시 목록";$("#addContentBtn").textContent="업무지시 추가";renderAssignmentHead();const q=els.search.value.trim();const rows=sortRows("assignments",state.assignments.map((a,i)=>({a,i})).filter(({a})=>Object.values(a).join(" ").includes(q)&&matchesColumnFilters("assignments",assignmentFilter(a))),assignmentFilter,"a");els.rows.innerHTML=rows.map(({a,i})=>`<tr><td>${esc(a.owner)}</td><td>${esc(a.type)}</td><td title="${esc(a.detail)}">${esc(a.title)}</td><td><select class="inline-select" data-assignment-priority="${i}">${assignmentPriorityOptions(a.priority)}</select></td><td>${esc(a.start)}</td><td>${esc(a.due)}</td><td><select class="inline-select" data-assignment-status="${i}">${assignmentStatusOptions(a.status)}</select></td><td><button class="btn icon" data-edit-assignment="${i}">✎</button></td></tr>`).join("")}
    function selectedRange(){return{year:els.kpiYear.value||today.slice(0,4),month:els.kpiMonth.value||"all"}}function inRange(a,r){return a.due&&a.due.startsWith(r.year)&&(r.month==="all"||a.due.slice(5,7)===r.month)}function employeeStats(name){const r=selectedRange(),rel=state.assignments.filter(a=>a.owner===name&&inRange(a,r));return{assigned:rel.length,completed:rel.filter(a=>a.status==="완료").length,open:rel.filter(a=>a.status!=="완료"&&a.status!=="보류").length,overdue:rel.filter(a=>a.status!=="완료"&&a.due&&a.due<today).length}}function renderPeople(){els.people.innerHTML=state.people.length?state.people.map((p,i)=>{const s=employeeStats(p.name),load=Math.min(100,Math.round(s.open/Math.max(Number(p.monthlyTarget)||1,1)*100));return`<div class="card"><div class="card-top"><span class="name">${esc(p.name)}</span><span class="badge ${load>90?"red":load>70?"amber":"green"}">${load}%</span></div><div class="meta">${esc(p.role)} · ${esc(p.area)}</div><div class="meta">진행 ${s.open}건 · 완료 ${s.completed}건 · 지연 ${s.overdue}건</div><div class="bar"><span style="width:${load}%"></span></div><div class="row-actions" style="margin-top:10px"><button class="btn icon" data-edit-person="${i}">✎</button><button class="btn icon danger" data-delete-person="${i}">×</button></div></div>`}).join(""):`<div class="meta">등록된 직원이 없습니다.</div>`}function renderEmployeeKpis(){const r=selectedRange();els.employeeKpis.innerHTML=state.people.map(p=>{const s=employeeStats(p.name),target=r.month==="all"?(Number(p.yearlyTarget)||1):(Number(p.monthlyTarget)||1),rate=s.assigned?Math.round(s.completed/s.assigned*100):0,score=Math.max(0,Math.min(120,Math.round(s.completed/target*100))-s.overdue*5);return`<div class="card"><div class="card-top"><span class="name">${esc(p.name)}</span><span class="badge ${score>=90?"green":score>=70?"amber":"red"}">${score}점</span></div><div class="meta">${r.month==="all"?"연간":Number(r.month)+"월"} 목표 ${target}건 기준</div><div class="mini-grid"><div class="mini-stat">배정<strong>${s.assigned}</strong></div><div class="mini-stat">완료<strong>${s.completed}</strong></div><div class="mini-stat">완료율<strong>${rate}%</strong></div><div class="mini-stat">지연<strong>${s.overdue}</strong></div></div></div>`}).join("")}
    function renderAssignments(){els.assignments.innerHTML=state.assignments.length?state.assignments.slice(0,20).map((a,i)=>`<div class="card"><div class="card-top"><span class="name">${esc(a.title)}</span><span class="badge ${priorityClass(a.priority)}">${esc(a.priority)}</span></div><div class="meta">${esc(a.owner)} · ${esc(a.project)} · 시작 ${esc(a.start)} · 마감 ${esc(a.due)}</div><div class="meta">${esc(a.detail)}</div><div class="row-actions" style="margin-top:10px"><button class="btn icon" data-edit-assignment="${i}">✎</button></div></div>`).join(""):`<div class="meta">등록된 업무지시가 없습니다.</div>`}function renderTodos(){els.todos.innerHTML=state.todos.length?state.todos.map((t,i)=>`<div class="card"><div class="card-top"><span class="name">${esc(t.title)}</span><span class="badge blue">${esc(t.status||t.badge||"확인")}</span></div><div class="meta">${esc(t.detail||"")}</div><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn icon danger" data-delete-todo="${i}">×</button></div>`).join(""):`<div class="meta">확인할 항목이 없습니다.</div>`}function todoStatusClass(s){return s==="백로그"?"todo-backlog":s==="할 일"?"todo-ready":s==="진행중"?"todo-doing":s==="완료"?"todo-done":"todo-cancel"}function todoMatches(t,q){return [t.title,t.detail,t.owner,t.status,t.priority].join(" ").toLowerCase().includes(q.toLowerCase())}function renderTodoBoard(){const panel=$("#todoBoardPanel"),statuses=["백로그","할 일","진행중","완료","취소"],q=$("#todoSearch")?.value||"",owners=["전체",...state.people.map(p=>p.name)],filtered=state.todos.map((t,i)=>({t,i})).filter(({t})=>(todoStatusFilter==="전체"||t.status===todoStatusFilter)&&(todoOwnerFilter==="전체"||t.owner===todoOwnerFilter)&&todoMatches(t,q));panel.innerHTML=`<div class="todo-toolbar"><div class="todo-view"><button class="active">보드</button><button>목록</button></div><button class="btn primary" id="todoAddBtn">할일 추가</button></div><div class="todo-filters"><input class="search" id="todoSearch" placeholder="제목, 설명, 담당자, 우선순위 검색" value="${esc(q)}"><div class="todo-chips"><button class="todo-chip ${todoStatusFilter==="전체"?"active":""}" data-todo-status-filter="전체">전체 <strong>${state.todos.length}</strong></button>${statuses.map(s=>`<button class="todo-chip ${todoStatusFilter===s?"active":""}" data-todo-status-filter="${esc(s)}">${esc(s)} <strong>${state.todos.filter(t=>t.status===s).length}</strong></button>`).join("")}</div><div class="todo-chips">${owners.map(o=>`<button class="todo-chip ${todoOwnerFilter===o?"active":""}" data-todo-owner-filter="${esc(o)}">${esc(o)} <strong>${o==="전체"?state.todos.length:state.todos.filter(t=>t.owner===o).length}</strong></button>`).join("")}</div></div><div class="todo-board">${statuses.map(s=>{const rows=filtered.filter(x=>x.t.status===s);return`<div class="todo-column"><div class="todo-column-head"><span>${esc(s)}</span><span class="count">${rows.length}</span></div>${rows.length?rows.map(({t,i})=>`<div class="todo-card ${todoStatusClass(t.status)}"><div class="todo-card-title">${esc(t.title)}</div><div class="todo-card-meta">${esc(t.owner||"담당 미정")} · ${esc(t.priority||"보통")} · ${esc(t.due||"")}</div><div class="todo-card-meta">${esc(t.detail||"")}</div><div class="row-actions" style="margin-top:10px"><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn icon danger" data-delete-todo="${i}">×</button></div></div>`).join(""):`<div class="meta">비어 있음</div>`}<button class="btn" data-add-todo-status="${esc(s)}">+ 빠른 추가</button></div>`}).join("")}</div>`;$("#todoSearch")?.addEventListener("input",renderTodoBoard)}
    function renderConstructionPanels(){const current=state.construction.filter(c=>c.status==="시공중"),upcoming=state.construction.filter(c=>c.status==="예정");els.currentPlants.innerHTML=current.length?current.map((c,i)=>plantCard(c,i)).join(""):`<div class="meta">현재 시공중인 발전소가 없습니다.</div>`;els.upcomingPlants.innerHTML=upcoming.length?upcoming.map((c,i)=>plantCard(c,i)).join(""):`<div class="meta">시공 예정 발전소가 없습니다.</div>`}function plantCard(c,i){const original=state.construction.indexOf(c);return`<div class="card"><div class="card-top"><span class="name">${esc(c.site)}</span><span class="badge ${statusClass(c.status)}">${esc(c.status)}</span></div><div class="meta">${esc(c.company)} · ${esc(c.kw)}kW · ${esc(c.customer||"고객")}</div><div class="meta">${esc(c.phase)} · ${esc(c.owner||"담당 미입력")} · ${esc(c.start)} ~ ${esc(c.end||"")}</div><div class="meta">완료월 ${esc(completionMonth(c.end)||"-")} · 소요일 ${durationDays(c.start,c.end)}일</div><button class="btn icon" data-edit-construction="${original}">✎</button></div>`}
    function renderKpis(){
      if(currentView==="dashboard"){
        els.kpis.classList.add("kpis-weather");
        els.kpis.innerHTML=`<div class="dash-top-grid"><section class="dash-section compact" style="margin:0;border-radius:16px"><div class="dash-title"><h2>🏗️ 시공 기상정보</h2><button class="btn" data-refresh-weather>새로고침</button></div><div id="dashWeatherContent" class="weather-grid"><div class="meta">기상 정보를 불러오는 중입니다.</div></div><div class="label" style="margin-top:10px">대구 7일 시공 예보</div><div id="dashForecastContent" class="forecast-strip"></div></section><section class="dash-section compact time-card" style="margin:0;border-radius:16px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center"><div id="dashClockBg" style="position:absolute;inset:0;background-size:cover;background-position:center;opacity:0.75;pointer-events:none;border-radius:16px"></div><div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.18) 0%,rgba(0,0,0,.38) 100%);border-radius:16px;pointer-events:none" id="dashClockScrim"></div><div style="position:relative;z-index:2;width:100%;text-align:center;padding:16px 0"><div id="dashClockDate" style="font-size:13px;font-weight:700;color:rgba(255,255,255,.85);letter-spacing:.6px;margin-bottom:8px;text-shadow:0 1px 4px rgba(0,0,0,.6)"></div><div id="dashClock" style="font-size:52px;font-weight:800;letter-spacing:-2px;color:#fff;line-height:1;text-shadow:0 3px 12px rgba(0,0,0,.75)"></div><div style="font-size:12px;color:rgba(255,255,255,.75);margin-top:10px;font-weight:600;letter-spacing:.4px;text-shadow:0 1px 4px rgba(0,0,0,.5)">Asia/Seoul 기준</div></div></section></div>`;
        let saved=localStorage.getItem("clockBgImage");
        if(!saved&&state.clockBgImage){saved=state.clockBgImage;localStorage.setItem("clockBgImage",saved);}
        if(saved){const el=document.getElementById("dashClockBg");if(el)el.style.backgroundImage=`url(${saved})`;}
        const inp=document.getElementById("clockBgInput");
        if(inp)inp.addEventListener("change",function(){const file=this.files[0];if(!file)return;const reader=new FileReader();reader.onload=function(e){localStorage.setItem("clockBgImage",e.target.result);const el=document.getElementById("dashClockBg");if(el)el.style.backgroundImage=`url(${e.target.result})`;};reader.readAsDataURL(file);});
        updateClock();setTimeout(()=>{if(typeof updateWeather==="function")updateWeather();},80);
        return;
      }
      els.kpis.classList.remove("kpis-weather");
      const con=state.construction,total=con.length,done=con.filter(c=>c.status==="완료").length,rate=total?Math.round(done/total*100):0,byStatus=["시공중","예정","지연"],byPhase=state.constructionPhases,byTeam=state.constructionTeams,kw=con.reduce((s,c)=>s+(Number(c.kw)||0),0),avg=done?Math.round(con.filter(c=>c.status==="완료").reduce((s,c)=>s+durationDays(c.start,c.end),0)/done):0;els.kpis.innerHTML=`<div class="kpi"><div class="label">시공 진행률</div><div class="donut" style="--p:${rate}%"><span>${rate}%</span></div><div class="delta">완료 ${done} / 전체 ${total}</div></div><div class="kpi"><div class="label">상태별 발전소</div>${byStatus.map(x=>barRow(x,con.filter(c=>c.status===x).length,total)).join("")}</div><div class="kpi"><div class="label">업무단계 분포</div>${byPhase.map(x=>barRow(x,con.filter(c=>c.phase===x).length,total)).join("")}</div><div class="kpi"><div class="label">시공 물량</div><div class="value">${kw}kW</div><div class="delta">평균 소요일 ${avg}일</div>${byTeam.map(x=>barRow(x,con.filter(c=>c.company===x).length,total)).join("")}</div>`}function barRow(label,value,total){const pct=total?Math.round(value/total*100):0;return`<div class="chart-row"><span>${esc(label)}</span><div class="chart-track"><div class="chart-fill" style="width:${pct}%"></div></div><strong>${value}</strong></div>`}
    function renderCalendarFilters(){ensureMonthOptions(els.calendarYear,els.calendarMonth)}function renderAssignmentCalendarFilters(){ensureMonthOptions(els.assignmentCalendarYear,els.assignmentCalendarMonth)}function renderAssignmentCalendar(){const y=Number(els.assignmentCalendarYear.value),m=Number(els.assignmentCalendarMonth.value)-1,first=new Date(y,m,1),start=new Date(first);start.setDate(1-first.getDay());const names=["일","월","화","수","목","금","토"];let html=names.map(n=>`<div class="day-name">${n}</div>`).join("");for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const iso=localDateString(d),tasks=state.assignments.filter(a=>a.start===iso||a.due===iso);html+=`<div class="day-cell ${d.getMonth()!==m?"muted":""}"><div class="day-number">${d.getDate()}</div>${tasks.map(t=>`<div class="calendar-task">${esc(t.owner)} · ${esc(t.title)}<br>${esc(t.status)} · ${esc(t.priority)}</div>`).join("")}</div>`}els.assignmentCalendarGrid.innerHTML=html}function renderCalendar(){const y=Number(els.calendarYear.value),m=Number(els.calendarMonth.value)-1,first=new Date(y,m,1),start=new Date(first);start.setDate(1-first.getDay());const names=["일","월","화","수","목","금","토"];let html=names.map(n=>`<div class="day-name">${n}</div>`).join("");for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const iso=localDateString(d),tasks=state.assignments.filter(a=>a.due===iso);html+=`<div class="day-cell ${d.getMonth()!==m?"muted":""}"><div class="day-number">${d.getDate()}</div>${tasks.map(t=>`<div class="calendar-task">${esc(t.owner)} · ${esc(t.title)}</div>`).join("")}</div>`}els.calendarGrid.innerHTML=html}
    function renderKpiFilters(){const y=Number(today.slice(0,4));els.kpiYear.innerHTML=[y-1,y,y+1].map(v=>`<option ${v===y?"selected":""}>${v}년</option>`).join("")}function renderConstructionReportFilters(){const y=Number(today.slice(0,4));els.constructionReportYear.innerHTML=[y-1,y,y+1].map(v=>`<option value="${v}" ${v===y?"selected":""}>${v}</option>`).join("");els.constructionReportMonth.innerHTML=Array.from({length:12},(_,i)=>`<option value="${String(i+1).padStart(2,"0")}" ${i+1===Number(today.slice(5,7))?"selected":""}>${i+1}월</option>`).join("")}
    function renderConstructionReport(){const ym=`${els.constructionReportYear.value}-${els.constructionReportMonth.value}`,done=state.construction.filter(c=>c.status==="완료"&&completionMonth(c.end)===ym),teams=state.constructionTeams.map(team=>{const list=done.filter(c=>c.company===team),kw=list.reduce((s,c)=>s+(Number(c.kw)||0),0),avg=list.length?Math.round(list.reduce((s,c)=>s+durationDays(c.start,c.end),0)/list.length):0;return{team,count:list.length,kw,avg}}).sort((a,b)=>b.kw-a.kw),totalKw=done.reduce((s,c)=>s+(Number(c.kw)||0),0);els.constructionReport.textContent=`${ym} 시공 완료 보고서\n\n1. 총괄\n- 완료 발전소: ${done.length}건\n- 완료 용량: ${totalKw}kW\n\n2. 시공사별 실적 및 순위\n${teams.map((t,i)=>`- ${i+1}위 ${t.team}: ${t.kw}kW / ${t.count}건 / 평균 ${t.avg}일`).join("\n")}\n\n3. 속도 분석\n${teams.map(t=>`- ${t.team}: ${t.count?`${t.avg}일 평균. 짧은 기간이면 착공 전 준비와 구조물팀 배정이 원활했던 것으로 볼 수 있고, 긴 기간이면 자재·인력·현장 조건을 확인해야 합니다.`:"완료 건 없음"}`).join("\n")}\n\n4. 개선 의견\n- 완료월과 완료일을 정확히 입력하면 월별 실적과 순위가 자동으로 정리됩니다.\n- 지연 사유는 다음 액션에 구체적으로 남기면 다음 보고서 분석 정확도가 올라갑니다.`}
    function renderCurrentContent(){if(currentView==="admin"){renderAdmin();return}if(currentView==="dashboard"){renderCalendar();return}renderWorkTable();if(currentView==="assignments"){renderAssignments();if(employeeSubView==="workload")renderPeople();if(employeeSubView==="kpi")renderEmployeeKpis()}else if(currentView==="construction")renderConstructionPanels();else renderTodos()}function adminListHtml(list,attr,placeholder){return list.map((v,i)=>`<div class="admin-item single"><input class="field" data-${attr}="${i}" value="${esc(v)}" placeholder="${esc(placeholder)}"><button class="btn icon danger" data-delete-${attr}="${i}">×</button></div>`).join("")}function renderAdmin(){if(!adminBasicEditMode){$("#adminBrand").value=state.brand;$("#adminTitle").value=state.title;$("#adminSubtitle").value=state.subtitle;$("#adminPin").value=state.adminPin}["#adminBrand","#adminTitle","#adminSubtitle","#adminPin"].forEach(id=>$(id).readOnly=!adminBasicEditMode);$("#saveAdminBasicBtn").disabled=!adminBasicEditMode;$("#editAdminBasicBtn").textContent=adminBasicEditMode?"수정 중":"수정 시작";$("#adminNavList").innerHTML=state.nav.map((n,i)=>`<div class="admin-item"><input class="field" data-admin-nav-icon="${i}" value="${esc(n.icon)}"><input class="field" data-admin-nav-label="${i}" value="${esc(n.label)}"><button class="btn icon" data-move-admin-nav="${i}" data-dir="-1" ${i===0?"disabled":""}>&uarr;</button><button class="btn icon" data-move-admin-nav="${i}" data-dir="1" ${i===state.nav.length-1?"disabled":""}>&darr;</button><button class="btn icon danger" data-delete-admin-nav="${i}">&times;</button></div>`).join("");$("#adminPhaseList").innerHTML=adminListHtml(state.phases,"admin-phase","업무단계");$("#adminConstructionPhaseList").innerHTML=adminListHtml(state.constructionPhases,"admin-construction-phase","시공단계");$("#adminAssignmentStatusList").innerHTML=adminListHtml(state.assignmentStatuses,"admin-assignment-status","업무상태");$("#adminTeamList").innerHTML=adminListHtml(state.constructionTeams,"admin-team","시공사");$("#adminStructureTeamList").innerHTML=adminListHtml(state.structureTeams,"admin-structure-team","구조물팀")}
    function openProjectModal(i=null){editingProjectIndex=i;const p=i===null?{name:"",phase:state.phases[0],owner:"",due:today,status:"정상",next:""}:state.projects[i];$("#projectName").value=p.name;$("#projectPhase").value=p.phase;$("#projectOwner").value=p.owner;$("#projectDue").value=p.due;$("#projectStatus").value=p.status;$("#projectNext").value=p.next;$("#deleteProjectInModalBtn").classList.toggle("hidden",i===null);$("#projectModal").classList.add("open")}function openConstructionModal(i=null){editingConstructionIndex=i;const c=i===null?{company:state.constructionTeams[0],structureTeam:state.structureTeams[0],site:"",address:"",kw:0,sales:"",customer:"",phase:state.constructionPhases[0],owner:"",start:today,end:"",status:"예정",next:""}:state.construction[i];$("#constructionCompany").value=c.company;$("#constructionStructureTeam").value=c.structureTeam||state.structureTeams[0];$("#constructionSite").value=c.site;$("#constructionAddress").value=c.address||"";$("#constructionKw").value=c.kw;$("#constructionSales").value=c.sales;$("#constructionCustomer").value=c.customer;$("#constructionPhase").value=c.phase;$("#constructionOwner").value=c.owner;$("#constructionStart").value=c.start;$("#constructionEnd").value=c.end;$("#constructionStatus").value=c.status;$("#constructionNext").value=c.next;$("#deleteConstructionInModalBtn").classList.toggle("hidden",i===null);updateConstructionDuration();$("#constructionModal").classList.add("open")}function updateConstructionDuration(){$("#constructionDuration").value=durationDays($("#constructionStart").value,$("#constructionEnd").value)+"일"}function withConstructionStatusLine(text,status){const line=`진행상태: ${status||""}`,raw=String(text||"");if(!status)return raw;const lines=raw.split(/\r?\n/),idx=lines.findIndex(x=>/^\s*진행상태\s*:/.test(x));if(idx>=0){lines[idx]=line;return lines.join("\n")}return raw.trim()?`${raw.replace(/\s+$/,"")}\n${line}`:line}function syncConstructionNextStatus(){const next=$("#constructionNext"),status=$("#constructionStatus")?.value;if(next&&status)next.value=withConstructionStatusLine(next.value,status)}function openAssignmentModal(i=null){editingAssignmentIndex=i;const a=i===null?{owner:state.people[0]?.name||"",project:state.projects[0]?.name||"일반업무",priority:"보통",status:"지시",start:today,due:today,type:"서류요청",title:"",detail:"",result:""}:state.assignments[i];$("#assignmentOwner").value=a.owner;$("#assignmentProject").value=a.project;$("#assignmentPriority").value=a.priority;$("#assignmentStatus").value=a.status;$("#assignmentStart").value=a.start||a.due||today;$("#assignmentDue").value=a.due;$("#assignmentType").value=a.type;$("#assignmentTitle").value=a.title;$("#assignmentDetail").value=a.detail;$("#assignmentResult").value=a.result;$("#deleteAssignmentInModalBtn").classList.toggle("hidden",i===null);$("#assignmentModal").classList.add("open")}function openPersonModal(i=null){editingPersonIndex=i;const p=i===null?{name:"",role:"직원",area:"",monthlyTarget:30,yearlyTarget:360}:state.people[i];$("#personName").value=p.name;$("#personRole").value=p.role;$("#personArea").value=p.area;$("#personMonthlyTarget").value=p.monthlyTarget;$("#personYearlyTarget").value=p.yearlyTarget;$("#deletePersonInModalBtn").classList.toggle("hidden",i===null);$("#personModal").classList.add("open")}function openTodoModal(i=null,status="\uD560 \uC77C"){editingTodoIndex=i;const t=i===null?{title:"",owner:state.people[0]?.name||"",status,priority:"\uBCF4\uD1B5",due:today,detail:""}:state.todos[i];$("#todoOwner").innerHTML=state.people.map(p=>`<option>${esc(p.name)}</option>`).join("")||`<option>\uB2F4\uB2F9 \uBBF8\uC815</option>`;$("#todoTitle").value=t.title||"";$("#todoOwner").value=t.owner||state.people[0]?.name||"\uB2F4\uB2F9 \uBBF8\uC815";$("#todoStatus").value=t.status||"\uD560 \uC77C";$("#todoPriority").value=t.priority||"\uBCF4\uD1B5";$("#todoDue").value=t.due||today;$("#todoDetail").value=t.detail||"";$("#deleteTodoInModalBtn").classList.toggle("hidden",i===null);$("#todoModal").classList.add("open")}
    function splitDbLine(line){if(line.includes("\t"))return line.split("\t").map(x=>x.trim());if(line.includes(","))return line.split(",").map(x=>x.trim());return line.split(/\s{2,}/).map(x=>x.trim()).filter(Boolean)}function normalizeDate(v){const s=String(v||"").trim(),m=s.match(/(20\d{2})[.\-\/년\s]*(\d{1,2})[.\-\/월\s]*(\d{1,2})/);return m?`${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`:""}function pickValue(obj,names){const key=Object.keys(obj).find(k=>names.some(n=>k.replace(/\s/g,"").includes(n)));return key?obj[key]:""}function mapDbStatus(v){const s=String(v||"");if(s.includes("완료")||s.includes("준공"))return"완료";if(s.includes("지연")||s.includes("보류"))return"지연";if(s.includes("시공")||s.includes("진행"))return"시공중";return"예정"}function mapDbPhase(v){const s=String(v||"");if(s.includes("완료")||s.includes("준공"))return"완료";if(s.includes("전기"))return"전기시공";if(s.includes("구조"))return"구조물시공";return"자재입고완료"}function parseDbPaste(){const lines=els.dbPasteText.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),first=splitDbLine(lines[0]||""),hasHeader=first.some(x=>/발전|현장|용량|kw|상태|시공|담당|고객|영업|착공|시작|완료/i.test(x)),headers=hasHeader?first:first.map((_,i)=>String(i)),data=hasHeader?lines.slice(1):lines;pendingDbImport=data.map(line=>{const cols=splitDbLine(line),obj={};headers.forEach((h,i)=>obj[h]=cols[i]||"");const all=cols.join(" "),site=pickValue(obj,["발전소명","발전소","현장명","현장","사업명"])||cols.find(c=>c.includes("발전")||c.includes("태양광"))||cols[0]||"",kwText=pickValue(obj,["용량","kw","KW","kW"])||all,company=state.constructionTeams.find(t=>all.includes(t))||pickValue(obj,["시공사","시공팀","업체"])||state.constructionTeams[0],structureTeam=state.structureTeams.find(t=>all.includes(t))||state.structureTeams[0],statusText=pickValue(obj,["상태","진행상태","공정","단계"])||all,start=normalizeDate(pickValue(obj,["시작일","착공일","시공시작","공사시작"])),end=normalizeDate(pickValue(obj,["완료일","준공일","종료일","공사완료"])),kw=(kwText.match(/(\d+(?:\.\d+)?)/)||[])[1]||0;return{company,structureTeam,site,kw:Number(kw)||0,sales:pickValue(obj,["영업자","영업","담당영업"]),customer:pickValue(obj,["고객","고객명","발주처"])||"",phase:mapDbPhase(statusText),owner:pickValue(obj,["담당자","담당","관리자"])||"",start:start||today,end:end||"",status:mapDbStatus(statusText),next:"DB 붙여넣기 가져옴"}}).filter(x=>x.site);renderDbPreview()}function renderDbPreview(){els.dbImportPreview.innerHTML=pendingDbImport.length?`<strong>${pendingDbImport.length}건 인식됨</strong>\n\n`+pendingDbImport.map((c,i)=>`${i+1}. ${c.site} / ${c.company} / ${c.kw}kW / ${c.status} / ${c.phase}`).join("\n"):"인식된 데이터가 없습니다."}function applyDbImport(){if(!pendingDbImport.length)parseDbPaste();if(!pendingDbImport.length)return;state.lastDbImportBackup={at:new Date().toISOString(),construction:clone(state.construction)};let added=0,updated=0;pendingDbImport.forEach(c=>{const i=state.construction.findIndex(x=>x.site===c.site);if(i>=0){state.construction[i]={...state.construction[i],...c};updated++}else{state.construction.unshift(c);added++}});$("#dbImportModal").classList.remove("open");saveState(`DB 데이터 ${added}건 추가, ${updated}건 업데이트했습니다.`);render()}function undoDbImport(){if(!state.lastDbImportBackup)return;state.construction=clone(state.lastDbImportBackup.construction);delete state.lastDbImportBackup;saveState("DB 가져오기 이전 상태로 되돌렸습니다.");render()}
    document.addEventListener("click",e=>{const t=e.target.closest("button,[data-sort-key]")||e.target;if(t.dataset.close)$("#"+t.dataset.close).classList.remove("open");if(t.dataset.sortKey){const s=sortState[t.dataset.sortView];s.dir=s.key===t.dataset.sortKey&&s.dir==="asc"?"desc":"asc";s.key=t.dataset.sortKey;renderWorkTable()}if(t.matches(".nav-btn")){const label=t.textContent.trim(),view=viewForLabel(label);if((view==="admin"||protectedView(view,label))&&!unlockAdmin())return;goToView(view,label)}if(t.id==="adminTopBtn"){if(unlockAdmin())goToView("admin","관리자")}if(t.id==="editAdminBasicBtn"){t.classList.remove("admin-click-pop");void t.offsetWidth;t.classList.add("admin-click-pop");adminBasicEditMode=true;renderAdmin()}if(t.dataset.employeeTab){if((t.dataset.employeeTab==="workload"||t.dataset.employeeTab==="kpi")&&!unlockAdmin())return;employeeSubView=t.dataset.employeeTab;renderEmployeePanels();renderCurrentContent()}if(t.id==="addProjectBtn"){if(currentView==="assignments")openAssignmentModal();else if(currentView==="todos")openTodoModal();else openProjectModal()}if(t.id==="dbPasteBtn"){pendingDbImport=[];els.dbPasteText.value="";els.dbImportPreview.textContent="붙여넣은 뒤 미리보기를 눌러주세요.";$("#dbImportModal").classList.add("open")}if(t.id==="parseDbPasteBtn")parseDbPaste();if(t.id==="applyDbImportBtn")applyDbImport();if(t.id==="undoDbImportBtn"&&confirm("마지막 DB 가져오기 이전 상태로 되돌릴까요?"))undoDbImport();if(t.id==="addContentBtn"){if(currentView==="assignments")openAssignmentModal();else if(currentView==="construction")openConstructionModal();else if(currentView==="todos")openTodoModal();else openProjectModal()}if(t.id==="calendarAddAssignmentBtn"||t.id==="addAssignmentBtn"||t.id==="assignmentCalendarAddBtn")openAssignmentModal();if(t.id==="addPersonBtn")openPersonModal();if(t.id==="openConstructionReportBtn"){renderConstructionReport();$("#constructionReportModal").classList.add("open")}if(t.id==="copyConstructionReportBtn"){navigator.clipboard?.writeText(els.constructionReport.textContent||"");toast("보고서를 복사했습니다.")}if(t.dataset.editProject)openProjectModal(Number(t.dataset.editProject));if(t.dataset.editConstruction)openConstructionModal(Number(t.dataset.editConstruction));if(t.dataset.editAssignment)openAssignmentModal(Number(t.dataset.editAssignment));if(t.dataset.editPerson)openPersonModal(Number(t.dataset.editPerson));if(t.id==="deleteProjectInModalBtn"&&editingProjectIndex!==null&&confirm("이 현장을 삭제할까요?")){state.projects.splice(editingProjectIndex,1);$("#projectModal").classList.remove("open");deleteAndSync("현장을 삭제했습니다.");render()}if(t.id==="deleteConstructionInModalBtn"&&editingConstructionIndex!==null&&confirm("이 시공일정을 삭제할까요?")){state.construction.splice(editingConstructionIndex,1);$("#constructionModal").classList.remove("open");deleteAndSync("시공일정을 삭제했습니다.");render()}if(t.id==="deleteAssignmentInModalBtn"&&editingAssignmentIndex!==null&&confirm("이 업무지시를 삭제할까요?")){state.assignments.splice(editingAssignmentIndex,1);$("#assignmentModal").classList.remove("open");deleteAndSync("업무지시를 삭제했습니다.");render()}if(t.id==="deletePersonInModalBtn"&&editingPersonIndex!==null&&confirm("이 직원을 삭제할까요?")){state.people.splice(editingPersonIndex,1);$("#personModal").classList.remove("open");deleteAndSync("직원을 삭제했습니다.");render()}if(t.dataset.todoStatusFilter){todoStatusFilter=t.dataset.todoStatusFilter;renderTodoBoard()}if(t.dataset.todoOwnerFilter){todoOwnerFilter=t.dataset.todoOwnerFilter;renderTodoBoard()}if(t.id==="addTodoBtn"||t.id==="todoAddBtn")openTodoModal();if(t.dataset.addTodoStatus)openTodoModal(null,t.dataset.addTodoStatus);if(t.dataset.editTodo)openTodoModal(Number(t.dataset.editTodo));if(t.dataset.deleteTodo){state.todos.splice(Number(t.dataset.deleteTodo),1);deleteAndSync("할일을 삭제했습니다.");render()}if(t.id==="exportBtn"){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="solar-admin-data.json";a.click();URL.revokeObjectURL(url)}if(t.id==="exportKpiBtn"){const lines=["직원명,배정,완료,지연"];state.people.forEach(p=>{const s=employeeStats(p.name);lines.push([p.name,s.assigned,s.completed,s.overdue].join(","))});const blob=new Blob(["\ufeff"+lines.join("\n")],{type:"text/csv"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="employee-kpi.csv";a.click();URL.revokeObjectURL(url)}if(t.id==="adminClockBgClear"){localStorage.removeItem("clockBgImage");const preview=document.getElementById("clockBgPreview");if(preview){preview.style.backgroundImage="";const empty=document.getElementById("clockBgEmpty");if(empty)empty.style.display="";}const dashBg=document.getElementById("dashClockBg");if(dashBg)dashBg.style.backgroundImage="";toast("시계 배경사진을 제거했습니다.");}
      // Google Sheets 동기화 버튼들
      if(t.id==="sheetsSyncNowBtn"){e.preventDefault();e.stopImmediatePropagation();if(!(state.sheetsUrl||"").trim()){toast("먼저 Apps Script URL을 설정해주세요.");return}toast("Google Sheets 동기화 중...");syncToGoogleSheets(true).then(()=>{}).catch(()=>toast("⚠️ 동기화 오류"));return}
      if(t.id==="sheetsScriptBtn"){e.preventDefault();e.stopImmediatePropagation();showSheetsScriptModal();return}
      if(t.id==="closeSheetsModal"){e.preventDefault();e.stopImmediatePropagation();$("#sheetsScriptModal")?.classList.remove("open");return}
      if(t.id==="copySheetsScriptBtn"){e.preventDefault();e.stopImmediatePropagation();const code=$("#sheetsScriptCode");if(code){navigator.clipboard?.writeText(code.textContent||code.innerText||"");toast("✅ Apps Script 코드가 클립보드에 복사됐습니다!")}return}
    });
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.dataset.moveAdminNav){const i=Number(t.dataset.moveAdminNav),j=i+Number(t.dataset.dir);if(j>=0&&j<state.nav.length){[state.nav[i],state.nav[j]]=[state.nav[j],state.nav[i]];saveState("순서를 변경했습니다.");render()}return}if(t.id==="adminAddNavBtn"){state.nav.push({icon:"•",label:"새 카테고리"});saveState("카테고리를 추가했습니다.");render()}if(t.id==="adminAddPhaseBtn"){state.phases.push("새 단계");saveState("업무단계를 추가했습니다.");render()}if(t.id==="adminAddConstructionPhaseBtn"){state.constructionPhases.push("새 단계");saveState("시공단계를 추가했습니다.");render()}if(t.id==="adminAddAssignmentStatusBtn"){state.assignmentStatuses.push("새 상태");saveState("업무상태를 추가했습니다.");render()}if(t.id==="adminAddTeamBtn"){state.constructionTeams.push("새 시공사");saveState("시공사를 추가했습니다.");render()}if(t.id==="adminAddStructureTeamBtn"){state.structureTeams.push("새 팀");saveState("구조물팀을 추가했습니다.");render()}if(t.dataset.deleteAdminNav){state.nav.splice(Number(t.dataset.deleteAdminNav),1);saveState("카테고리를 삭제했습니다.");render()}if(t.dataset.deleteAdminPhase){state.phases.splice(Number(t.dataset.deleteAdminPhase),1);saveState("업무단계를 삭제했습니다.");render()}if(t.dataset.deleteAdminConstructionPhase){state.constructionPhases.splice(Number(t.dataset.deleteAdminConstructionPhase),1);saveState("시공단계를 삭제했습니다.");render()}if(t.dataset.deleteAdminAssignmentStatus){state.assignmentStatuses.splice(Number(t.dataset.deleteAdminAssignmentStatus),1);saveState("업무상태를 삭제했습니다.");render()}if(t.dataset.deleteAdminTeam){state.constructionTeams.splice(Number(t.dataset.deleteAdminTeam),1);saveState("시공사를 삭제했습니다.");render()}if(t.dataset.deleteAdminStructureTeam){state.structureTeams.splice(Number(t.dataset.deleteAdminStructureTeam),1);saveState("구조물팀을 삭제했습니다.");render()}});
    document.addEventListener("change",e=>{const t=e.target;if(t.id==="adminClockBgInput"){const file=t.files[0];if(!file)return;const reader=new FileReader();reader.onload=function(ev){localStorage.setItem("clockBgImage",ev.target.result);const preview=document.getElementById("clockBgPreview");if(preview){preview.style.backgroundImage="url("+ev.target.result+")";const empty=document.getElementById("clockBgEmpty");if(empty)empty.style.display="none";}const dashBg=document.getElementById("dashClockBg");if(dashBg)dashBg.style.backgroundImage="url("+ev.target.result+")";};reader.readAsDataURL(file);}if(t.dataset.assignmentPriority){const a=state.assignments[Number(t.dataset.assignmentPriority)];if(a){a.priority=t.value;saveState("우선순위를 변경했습니다.");renderCurrentContent();renderKpis()}}if(t.dataset.assignmentStatus){const a=state.assignments[Number(t.dataset.assignmentStatus)];if(a){a.status=t.value;saveState("상태를 변경했습니다.");renderCurrentContent();renderKpis()}}});
    document.addEventListener("input",e=>{const t=e.target;if(t.id==="constructionStart"||t.id==="constructionEnd")updateConstructionDuration();if(t.dataset.adminNavIcon){state.nav[Number(t.dataset.adminNavIcon)].icon=t.value;persistState();renderNav()}if(t.dataset.adminNavLabel){state.nav[Number(t.dataset.adminNavLabel)].label=t.value;persistState();renderNav()}if(t.dataset.adminPhase){state.phases[Number(t.dataset.adminPhase)]=t.value;persistState();renderFilters()}if(t.dataset.adminConstructionPhase){state.constructionPhases[Number(t.dataset.adminConstructionPhase)]=t.value;persistState();renderFilters()}if(t.dataset.adminAssignmentStatus){state.assignmentStatuses[Number(t.dataset.adminAssignmentStatus)]=t.value;persistState();renderFilters()}if(t.dataset.adminTeam){state.constructionTeams[Number(t.dataset.adminTeam)]=t.value;persistState();renderFilters();renderKpis()}if(t.dataset.adminStructureTeam){state.structureTeams[Number(t.dataset.adminStructureTeam)]=t.value;persistState();renderFilters()}if(t.dataset.columnFilter){const view=t.dataset.columnView,key=t.dataset.columnFilter,pos=t.selectionStart;columnFilters[view][key]=t.value;renderWorkTable();const next=document.querySelector(`[data-column-view="${view}"][data-column-filter="${key}"]`);if(next){next.focus();next.setSelectionRange(pos,pos)}}});
    document.addEventListener("change",e=>{const t=e.target;if(t.id==="constructionStatus")syncConstructionNextStatus()});
    els.search.addEventListener("input",renderWorkTable);els.phaseFilter.addEventListener("change",()=>{if(currentView!=="construction")currentView="projects";localStorage.setItem(viewStorageKey,currentView);renderNav();renderView();renderCurrentContent()});els.kpiYear.addEventListener("change",()=>{renderPeople();renderEmployeeKpis()});els.kpiMonth.addEventListener("change",()=>{renderPeople();renderEmployeeKpis()});els.calendarYear.addEventListener("change",renderCalendar);els.calendarMonth.addEventListener("change",renderCalendar);els.constructionReportYear.addEventListener("change",renderConstructionReport);els.constructionReportMonth.addEventListener("change",renderConstructionReport);
    /* ── 관리자 기본설정 저장 ── */
    $("#saveAdminBasicBtn").onclick=()=>{const btn=$("#saveAdminBasicBtn");if(!adminBasicEditMode)return;btn.classList.remove("admin-click-pop","admin-saved-flash");void btn.offsetWidth;btn.classList.add("admin-click-pop");state.brand=$("#adminBrand").value;state.title=$("#adminTitle").value;state.subtitle=$("#adminSubtitle").value;state.adminPin=$("#adminPin").value||"1234";state.geminiKey=($("#adminGeminiKey")?.value||"").trim();state.sheetsUrl=($("#adminSheetsUrl")?.value||"").trim();state.sheetsSecret=($("#adminSheetsSecret")?.value||"").trim();adminBasicEditMode=false;saveState("기본 설정을 저장했습니다.");render();const savedBtn=$("#saveAdminBasicBtn");savedBtn.classList.add("admin-saved-flash");setTimeout(()=>savedBtn.classList.remove("admin-click-pop","admin-saved-flash"),900)};
    /* ── 현장 저장 ── */
    $("#saveProjectBtn").onclick=()=>{const p={name:$("#projectName").value||"이름 없는 현장",phase:$("#projectPhase").value,owner:$("#projectOwner").value,due:$("#projectDue").value,status:$("#projectStatus").value,next:$("#projectNext").value};editingProjectIndex===null?state.projects.unshift(p):state.projects[editingProjectIndex]=p;$("#projectModal").classList.remove("open");saveState("현장을 저장했습니다.");render()};
    /* ── 시공일정 저장 ── */
    $("#saveConstructionBtn").onclick=()=>{const status=$("#constructionStatus").value,c={company:$("#constructionCompany").value,structureTeam:$("#constructionStructureTeam").value,site:$("#constructionSite").value||"이름 없는 발전소",address:$("#constructionAddress")?.value||"",kw:Number($("#constructionKw").value)||0,sales:$("#constructionSales").value,customer:$("#constructionCustomer").value,phase:$("#constructionPhase").value,owner:$("#constructionOwner").value,start:$("#constructionStart").value||today,end:$("#constructionEnd").value||"",status,next:withConstructionStatusLine($("#constructionNext").value,status)};editingConstructionIndex===null?state.construction.unshift(c):state.construction[editingConstructionIndex]=c;$("#constructionModal").classList.remove("open");saveState("시공일정을 저장했습니다.");render()};
    /* ── 직원 저장 ── */
    $("#savePersonBtn").onclick=()=>{const p={name:$("#personName").value||"이름 없는 직원",role:$("#personRole").value||"직원",area:$("#personArea").value||"담당업무 미입력",monthlyTarget:Number($("#personMonthlyTarget").value)||0,yearlyTarget:Number($("#personYearlyTarget").value)||0};editingPersonIndex===null?state.people.push(p):state.people[editingPersonIndex]=p;$("#personModal").classList.remove("open");saveState("직원 정보를 저장했습니다.");render()};
    /* ── 할일 삭제 ── */
    $("#deleteTodoInModalBtn").onclick=()=>{if(editingTodoIndex!==null&&confirm("이 할일과 연결된 일정을 함께 삭제할까요?")){deleteTodoAt(editingTodoIndex);$("#todoModal").classList.remove("open");saveState("삭제했습니다.");render()}};
    /* ── saveAssignmentBtn / saveTodoBtn 은 아래 assignmentSave / saveTodoBtn.onclick 에서 등록됨 ── */
    els.assignmentCalendarYear.addEventListener("change",renderAssignmentCalendar);els.assignmentCalendarMonth.addEventListener("change",renderAssignmentCalendar);$("#assignmentCalendarAddBtn").onclick=openAssignmentModal;
    
    function setTimeByDuration(min){if(!$("#assignmentStartTime").value)$("#assignmentStartTime").value="09:00";const [h,m]=$("#assignmentStartTime").value.split(":").map(Number),d=new Date(2000,0,1,h||0,m||0);d.setMinutes(d.getMinutes()+Number(min||60));$("#assignmentEndTime").value=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}
    function googleDate(date,time,end=false){const raw=(date||today).replaceAll("-","");if($("#assignmentAllDay")?.checked&&!time)return end?raw:raw;return raw+"T"+(time|| (end?"1000":"0900")).replace(":","")+"00"}
    function currentAssignmentForm(){return{owner:$("#assignmentOwner").value,project:$("#assignmentProject").value,priority:$("#assignmentPriority").value,status:$("#assignmentStatus").value,start:$("#assignmentStart").value||today,due:$("#assignmentDue").value||$("#assignmentStart").value||today,startTime:$("#assignmentStartTime").value,endTime:$("#assignmentEndTime").value,allDay:$("#assignmentAllDay").checked,repeat:$("#assignmentRepeat").value,location:$("#assignmentLocation").value,type:$("#assignmentType").value,title:$("#assignmentTitle").value||"제목 없는 일정",detail:$("#assignmentDetail").value,result:$("#assignmentResult").value}}
    function googleCalendarUrl(a){const start=googleDate(a.start,a.startTime),end=googleDate(a.due,a.endTime,true),details=[a.detail,a.owner?"담당: "+a.owner:"",a.project?"프로젝트: "+a.project:""].filter(Boolean).join("\n");return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(a.title)+"&dates="+encodeURIComponent(start+"/"+end)+"&details="+encodeURIComponent(details)+"&location="+encodeURIComponent(a.location||"")}
    openAssignmentModal=function(i=null){editingAssignmentIndex=i;const a=i===null?{owner:state.people[0]?.name||"",project:state.projects[0]?.name||"일반업무",priority:"보통",status:"지시",start:today,due:today,startTime:"09:00",endTime:"10:00",allDay:false,repeat:"반복 없음",location:"",type:"일반업무",title:"",detail:"",result:""}:state.assignments[i];$("#assignmentOwner").value=a.owner;$("#assignmentProject").value=a.project;$("#assignmentPriority").value=a.priority;$("#assignmentStatus").value=a.status;$("#assignmentStart").value=a.start||a.due||today;$("#assignmentDue").value=a.due||a.start||today;$("#assignmentStartTime").value=a.startTime||"09:00";$("#assignmentEndTime").value=a.endTime||"10:00";$("#assignmentAllDay").checked=!!a.allDay;$("#assignmentRepeat").value=a.repeat||"반복 없음";$("#assignmentLocation").value=a.location||"";$("#assignmentType").value=a.type||"일반업무";$("#assignmentTitle").value=a.title||"";$("#assignmentDetail").value=a.detail||"";$("#assignmentResult").value=a.result||"";$("#deleteAssignmentInModalBtn").classList.toggle("hidden",i===null);$("#assignmentModal").classList.add("open")}
    function assignmentSave(){const a=currentAssignmentForm();if(editingAssignmentIndex!==null){a.id=state.assignments[editingAssignmentIndex].id;a.linkedTodoId=state.assignments[editingAssignmentIndex].linkedTodoId}editingAssignmentIndex===null?state.assignments.unshift(a):state.assignments[editingAssignmentIndex]=a;syncAssignmentToTodo(editingAssignmentIndex===null?0:editingAssignmentIndex);setCalendarMonth(els.calendarYear,els.calendarMonth,a.due);setCalendarMonth(els.assignmentCalendarYear,els.assignmentCalendarMonth,a.start||a.due);$("#assignmentModal").classList.remove("open");saveState("일정과 할일을 함께 저장했습니다.");render()}
    $("#saveAssignmentBtn").onclick=assignmentSave;$("#googleCalendarBtn").onclick=()=>{window.open(googleCalendarUrl(currentAssignmentForm()),"_blank")};
    $("#saveTodoBtn").onclick=()=>{const t={title:$("#todoTitle").value||"제목 없는 할일",owner:$("#todoOwner").value,status:$("#todoStatus").value,priority:$("#todoPriority").value,due:$("#todoDue").value||today,detail:$("#todoDetail").value};if(editingTodoIndex!==null){t.id=state.todos[editingTodoIndex].id;t.linkedAssignmentId=state.todos[editingTodoIndex].linkedAssignmentId}editingTodoIndex===null?state.todos.unshift(t):state.todos[editingTodoIndex]=t;syncTodoToAssignment(editingTodoIndex===null?0:editingTodoIndex);setCalendarMonth(els.calendarYear,els.calendarMonth,t.due);setCalendarMonth(els.assignmentCalendarYear,els.assignmentCalendarMonth,t.due);$("#todoModal").classList.remove("open");saveState("할일과 일정을 함께 저장했습니다.");render()};

    renderCurrentContent=function(){if(currentView==="admin"){renderAdmin();return}if(currentView==="dashboard"){renderCalendar();return}if(currentView==="assignments"){renderAssignmentCalendar();$("#todoBoardPanel").classList.add("hidden");els.tableFilters.classList.add("hidden");els.tableWrap.classList.add("hidden");els.assignmentCalendarPanel.classList.remove("hidden");els.tableTitle.textContent="일정관리";$("#addContentBtn").textContent="일정 등록";els.dbPasteBtn.classList.add("hidden");els.undoDbImportBtn.classList.add("hidden");return}if(currentView==="todos"){$("#todoBoardPanel").classList.remove("hidden");els.assignmentCalendarPanel.classList.add("hidden");els.tableTitle.textContent="할일관리";els.dbPasteBtn.classList.add("hidden");els.undoDbImportBtn.classList.add("hidden");renderTodoBoard();return}$("#todoBoardPanel").classList.add("hidden");els.tableFilters.classList.remove("hidden");els.tableWrap.classList.remove("hidden");els.assignmentCalendarPanel.classList.add("hidden");renderWorkTable();if(currentView==="construction")renderConstructionPanels();else renderTodos()};
    function ensureMonthOptions(yearEl,monthEl){const y=Number(yearEl.value||today.slice(0,4)),m=monthEl.value||today.slice(5,7);yearEl.innerHTML=[y-1,y,y+1].map(v=>`<option ${v===y?"selected":""}>${v}</option>`).join("");monthEl.innerHTML=Array.from({length:12},(_,i)=>{const v=String(i+1).padStart(2,"0");return `<option value="${v}" ${v===m?"selected":""}>${i+1}월</option>`}).join("")}
    function todoListHtml(rows){return `<div class="todo-list"><div class="todo-list-row head"><span>제목</span><span>담당</span><span>상태</span><span>우선</span><span>마감</span><span>관리</span></div>${rows.length?rows.map(({t,i})=>`<div class="todo-list-row"><strong>${esc(t.title)}</strong><span>${esc(t.owner||"담당 미정")}</span><span><span class="badge ${statusClass(t.status)}">${esc(t.status)}</span></span><span>${esc(t.priority||"보통")}</span><span>${esc(t.due||"")}</span><span><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn icon danger" data-delete-todo="${i}">×</button></span></div>`).join(""):`<div class="todo-list-row"><span class="meta">등록된 할일이 없습니다.</span></div>`}</div>`}
    renderTodoBoard=function(){ensureTaskLinks();const panel=$("#todoBoardPanel"),statuses=["백로그","할 일","진행중","완료","취소"],q=$("#todoSearch")?.value||"",owners=["전체",...state.people.map(p=>p.name)],filtered=state.todos.map((t,i)=>({t,i})).filter(({t})=>(todoStatusFilter==="전체"||t.status===todoStatusFilter)&&(todoOwnerFilter==="전체"||t.owner===todoOwnerFilter)&&todoMatches(t,q));const chips=`<div class="todo-chips"><button class="todo-chip ${todoStatusFilter==="전체"?"active":""}" data-todo-status-filter="전체">전체 <strong>${state.todos.length}</strong></button>${statuses.map(s=>`<button class="todo-chip ${todoStatusFilter===s?"active":""}" data-todo-status-filter="${esc(s)}">${esc(s)} <strong>${state.todos.filter(t=>t.status===s).length}</strong></button>`).join("")}</div><div class="todo-chips">${owners.map(o=>`<button class="todo-chip ${todoOwnerFilter===o?"active":""}" data-todo-owner-filter="${esc(o)}">${esc(o)} <strong>${o==="전체"?state.todos.length:state.todos.filter(t=>t.owner===o).length}</strong></button>`).join("")}</div>`;const board=`<div class="todo-board">${statuses.map(s=>{const rows=filtered.filter(x=>x.t.status===s);return`<div class="todo-column"><div class="todo-column-head"><span>${esc(s)}</span><span class="count">${rows.length}</span></div>${rows.length?rows.map(({t,i})=>`<div class="todo-card ${todoStatusClass(t.status)}"><div class="todo-card-title">${esc(t.title)}</div><div class="todo-card-meta">${esc(t.owner||"담당 미정")} · ${esc(t.priority||"보통")} · ${esc(t.due||"")}</div><div class="todo-card-meta">${esc(t.detail||"")}</div><div class="row-actions" style="margin-top:10px"><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn icon danger" data-delete-todo="${i}">×</button></div></div>`).join(""):`<div class="meta">비어 있음</div>`}<button class="btn" data-add-todo-status="${esc(s)}">+ 빠른 추가</button></div>`}).join("")}</div>`;panel.innerHTML=`<div class="todo-toolbar"><div class="todo-view"><button class="${todoViewMode==="board"?"active":""}" data-todo-view="board">보드</button><button class="${todoViewMode==="list"?"active":""}" data-todo-view="list">목록</button></div><button class="btn primary" id="todoAddBtn">할일 추가</button></div><div class="todo-filters"><input class="search" id="todoSearch" placeholder="제목, 설명, 담당자, 우선순위 검색" value="${esc(q)}">${chips}</div>${todoViewMode==="list"?todoListHtml(filtered):board}`;$("#todoSearch")?.addEventListener("input",renderTodoBoard)};
    function setCalendarMonth(yearEl,monthEl,date){if(!date||!/^\d{4}-\d{2}/.test(date))return;yearEl.value=date.slice(0,4);monthEl.value=date.slice(5,7);ensureMonthOptions(yearEl,monthEl)}
    function shiftAssignmentMonth(delta){let y=Number(els.assignmentCalendarYear.value),m=Number(els.assignmentCalendarMonth.value)-1+delta;y+=Math.floor(m/12);m=((m%12)+12)%12;els.assignmentCalendarYear.value=String(y);els.assignmentCalendarMonth.value=String(m+1).padStart(2,"0");ensureMonthOptions(els.assignmentCalendarYear,els.assignmentCalendarMonth);renderAssignmentCalendar()}
    function assignmentDateFor(a){return a.start||a.due||today}
    function renderAssignmentPeopleChips(){const people=["전체",...state.people.map(p=>p.name)],counts=Object.fromEntries(people.map(p=>[p,p==="전체"?state.assignments.length:state.assignments.filter(a=>a.owner===p).length]));$("#assignmentPeopleChips").innerHTML=people.map(p=>`<button class="person-chip ${assignmentPersonFilter===p?"active":""}" data-assignment-person="${esc(p)}">${esc(p)} <strong>${counts[p]||0}</strong></button>`).join("")}
    function assignmentColorClass(a){if(a.priority==="긴급")return"pastel-red";if(a.priority==="높음")return"pastel-amber";if(a.type==="현장확인"||a.type==="시공")return"pastel-green";if(a.type==="인허가"||a.type==="한전")return"pastel-pink";return"pastel-blue"}
    function assignmentTaskHtml(t){const i=state.assignments.indexOf(t);return `<div class="calendar-task ${assignmentColorClass(t)}" data-open-assignment="${i}" title="${esc(t.detail||t.title)}">${esc(t.owner)} · ${esc(t.title)}<br>${esc(t.status)} · ${esc(t.priority)}</div>`}
    function renderScheduleViewButtons(){$$("[data-schedule-view]").forEach(b=>b.classList.toggle("active",b.dataset.scheduleView===assignmentCalendarView))}
    renderCalendarFilters=function(){ensureMonthOptions(els.calendarYear,els.calendarMonth)};
    renderAssignmentCalendarFilters=function(){ensureMonthOptions(els.assignmentCalendarYear,els.assignmentCalendarMonth)};
    renderAssignmentCalendar=function(){renderAssignmentPeopleChips();renderScheduleViewButtons();const y=Number(els.assignmentCalendarYear.value),m=Number(els.assignmentCalendarMonth.value)-1,first=new Date(y,m,1),start=new Date(first);start.setDate(1-first.getDay());const names=["일","월","화","수","목","금","토"],days=assignmentCalendarView==="month"?42:assignmentCalendarView==="week"?7:1;let html=(assignmentCalendarView==="day"?["일정"]:names).map(n=>`<div class="day-name">${n}</div>`).join("");for(let i=0;i<days;i++){const d=assignmentCalendarView==="day"?new Date(y,m,1):new Date(start);if(assignmentCalendarView!=="day")d.setDate(start.getDate()+i);const iso=localDateString(d),tasks=state.assignments.filter(a=>(assignmentPersonFilter==="전체"||a.owner===assignmentPersonFilter)&&(a.start===iso||a.due===iso));html+=`<div class="day-cell ${d.getMonth()!==m?"muted":""}"><div class="day-number">${d.getDate()}</div>${tasks.map(assignmentTaskHtml).join("")}</div>`}els.assignmentCalendarGrid.style.gridTemplateColumns=assignmentCalendarView==="day"?"1fr":"repeat(7,minmax(0,1fr))";els.assignmentCalendarGrid.innerHTML=html};
    renderCalendar=function(){const y=Number(els.calendarYear.value),m=Number(els.calendarMonth.value)-1,first=new Date(y,m,1),start=new Date(first);start.setDate(1-first.getDay());const names=["일","월","화","수","목","금","토"];let html=names.map(n=>`<div class="day-name">${n}</div>`).join("");for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const iso=localDateString(d),tasks=state.assignments.filter(a=>a.due===iso);html+=`<div class="day-cell ${d.getMonth()!==m?"muted":""}"><div class="day-number">${d.getDate()}</div>${tasks.map(t=>`<div class="calendar-task">${esc(t.owner)} · ${esc(t.title)}</div>`).join("")}</div>`}els.calendarGrid.innerHTML=html};
    $("#saveAssignmentBtn").onclick=()=>{const a={owner:$("#assignmentOwner").value,project:$("#assignmentProject").value,priority:$("#assignmentPriority").value,status:$("#assignmentStatus").value,start:$("#assignmentStart").value||today,due:$("#assignmentDue").value||today,type:$("#assignmentType").value,title:$("#assignmentTitle").value||"제목 없는 일정",detail:$("#assignmentDetail").value,result:$("#assignmentResult").value};if(editingAssignmentIndex!==null){a.id=state.assignments[editingAssignmentIndex].id;a.linkedTodoId=state.assignments[editingAssignmentIndex].linkedTodoId}editingAssignmentIndex===null?state.assignments.unshift(a):state.assignments[editingAssignmentIndex]=a;syncAssignmentToTodo(editingAssignmentIndex===null?0:editingAssignmentIndex);setCalendarMonth(els.calendarYear,els.calendarMonth,a.due);setCalendarMonth(els.assignmentCalendarYear,els.assignmentCalendarMonth,a.start||a.due);$("#assignmentModal").classList.remove("open");saveState("일정과 할일을 함께 저장했습니다.");render()};
    document.addEventListener("click",e=>{const t=e.target.closest("button,.calendar-task")||e.target;if(t.dataset.openAssignment){openAssignmentModal(Number(t.dataset.openAssignment))}if(t.id==="assignmentPrevMonth")shiftAssignmentMonth(-1);if(t.id==="assignmentNextMonth")shiftAssignmentMonth(1);if(t.id==="assignmentTodayBtn"){setCalendarMonth(els.assignmentCalendarYear,els.assignmentCalendarMonth,today);renderAssignmentCalendar()}if(t.dataset.assignmentPerson){assignmentPersonFilter=t.dataset.assignmentPerson;renderAssignmentCalendar()}if(t.dataset.scheduleView){assignmentCalendarView=t.dataset.scheduleView;renderAssignmentCalendar()}});
    $("#saveAssignmentBtn").onclick=assignmentSave;$("#googleCalendarBtn").onclick=()=>{window.open(googleCalendarUrl(currentAssignmentForm()),"_blank")};
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.id==="deleteAssignmentInModalBtn"&&editingAssignmentIndex!==null){e.preventDefault();e.stopImmediatePropagation();if(confirm("이 일정과 연결된 할일을 함께 삭제할까요?")){deleteAssignmentAt(editingAssignmentIndex);$("#assignmentModal").classList.remove("open");saveState("일정과 할일을 함께 삭제했습니다.");render()}}if(t.id==="deleteTodoInModalBtn"&&editingTodoIndex!==null){e.preventDefault();e.stopImmediatePropagation();if(confirm("이 할일과 연결된 일정을 함께 삭제할까요?")){deleteTodoAt(editingTodoIndex);$("#todoModal").classList.remove("open");saveState("할일과 일정을 함께 삭제했습니다.");render()}}},true);
    adminListHtml=function(list,attr,placeholder){return list.map((v,i)=>`<div class="admin-item single"><input class="field" data-${attr}="${i}" value="${esc(v)}" placeholder="${esc(placeholder)}"><button class="btn icon" data-move-admin-list="${attr}" data-index="${i}" data-dir="-1" ${i===0?"disabled":""}>&uarr;</button><button class="btn icon" data-move-admin-list="${attr}" data-index="${i}" data-dir="1" ${i===list.length-1?"disabled":""}>&darr;</button><button class="btn icon danger" data-delete-${attr}="${i}">&times;</button></div>`).join("")};
    function adminArrayFor(attr){return attr==="admin-phase"?state.phases:attr==="admin-construction-phase"?state.constructionPhases:attr==="admin-assignment-status"?state.assignmentStatuses:attr==="admin-team"?state.constructionTeams:attr==="admin-structure-team"?state.structureTeams:null}
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.dataset.todoMainTab){todoPanelTab=t.dataset.todoMainTab;renderTodoBoard();return;}if(t.dataset.todoView){todoPanelTab="tasks";todoViewMode=t.dataset.todoView;renderTodoBoard()}if(t.dataset.diaryNav!==undefined){const d=new Date(diaryDateCursor||today);d.setDate(d.getDate()+Number(t.dataset.diaryNav));diaryDateCursor=d.toISOString().slice(0,10);renderTodoBoard();return;}if(t.dataset.diaryToday!==undefined){diaryDateCursor=today;renderTodoBoard();return;}if(t.dataset.diaryGoto){diaryDateCursor=t.dataset.diaryGoto;renderTodoBoard();return;}if(t.dataset.diarySave!==undefined){if(!state.workDiary)state.workDiary=[];const date=diaryDateCursor||today,txt=document.getElementById("diaryManualInput")?.value||"";const idx=state.workDiary.findIndex(e=>e.date===date);if(idx>=0)state.workDiary[idx].manual=txt;else state.workDiary.unshift({date,manual:txt});saveState("업무일지를 저장했습니다.");toast("업무일지를 저장했습니다.");renderTodoBoard();return;}if(t.dataset.diaryCopy!==undefined){const date=diaryDateCursor||today;const autoEntries=state.todos.filter(t=>t.updatedAt&&t.updatedAt.startsWith(date));const entry=state.workDiary?.find(e=>e.date===date)||{manual:""};let text=`[업무일지] ${date}\n\n`;if(autoEntries.length){text+="▶ 작업 내역\n"+autoEntries.map(t=>`- [${t.status}] ${t.title}${t.project?` (${t.project})`:""}`).join("\n")+"\n\n";}if(entry.manual)text+="▶ 메모\n"+entry.manual;navigator.clipboard?.writeText(text);toast("업무일지를 클립보드에 복사했습니다.");return;}if(t.dataset.diaryGen!==undefined){if(!state.workDiary)state.workDiary=[];const date=diaryDateCursor||today;const autoEntries=state.todos.filter(t=>t.updatedAt&&t.updatedAt.startsWith(date));const genText=autoEntries.map(t=>`[${t.status}] ${t.title}${t.project?` (${t.project})`:""}`).join("\n");const ta=document.getElementById("diaryManualInput");if(ta){ta.value=(ta.value?ta.value+"\n\n":"")+genText;ta.focus();}return;}if(t.dataset.durationMin)setTimeByDuration(t.dataset.durationMin);if(t.dataset.moveAdminList){const arr=adminArrayFor(t.dataset.moveAdminList),i=Number(t.dataset.index),j=i+Number(t.dataset.dir);if(arr&&j>=0&&j<arr.length){[arr[i],arr[j]]=[arr[j],arr[i]];saveState("순서를 변경했습니다.");render()}}});
    function ensureConfigLists(){state.todoStatuses=state.todoStatuses&&state.todoStatuses.length?state.todoStatuses:["백로그","할 일","진행중","완료","취소"];state.priorities=state.priorities&&state.priorities.length?state.priorities:["보통","높음","긴급","낮음"];state.assignmentTypes=state.assignmentTypes&&state.assignmentTypes.length?state.assignmentTypes:["일반업무","회의","서류요청","현장확인","인허가","한전","시공","정산"];state.assignmentStatuses=state.assignmentStatuses&&state.assignmentStatuses.length?state.assignmentStatuses:["지시","진행","검토요청","완료","보류"];state.statuses=state.statuses&&state.statuses.length?state.statuses:["정상","대기","보완","지연","완료"];state.people=state.people&&state.people.length?state.people:[{name:"이재강",role:"과장",area:"담당업무 미입력",monthlyTarget:30,yearlyTarget:360}];state.projects=(state.projects||[]).map(p=>typeof p==="string"?{name:p}:p);if(!state.people.some(p=>p.name===assignmentPersonFilter))assignmentPersonFilter="전체";if(!state.people.some(p=>p.name===todoOwnerFilter))todoOwnerFilter="전체";if(!state.todoStatuses.includes(todoStatusFilter))todoStatusFilter="전체"}
    const cleanChoice=(v,fallback,list)=>v&&!String(v).includes("?")&&(!list||list.includes(v))?v:fallback;
    normalizeAssignment=function(a){ensureConfigLists();if(!a.id)a.id=uid("assignment");if(!a.start)a.start=a.due||today;if(!a.due)a.due=a.start||today;a.priority=cleanChoice(a.priority,state.priorities[0],state.priorities);a.status=cleanChoice(a.status,state.assignmentStatuses[0],state.assignmentStatuses);a.type=cleanChoice(a.type,state.assignmentTypes[0],state.assignmentTypes);a.project=cleanChoice(a.project,"일반업무");a.title=cleanChoice(a.title,"제목 없는 일정");if(!a.startTime)a.startTime="09:00";if(!a.endTime)a.endTime="10:00";a.repeat=cleanChoice(a.repeat,"반복 없음");return a}
    normalizeTodo=function(t){ensureConfigLists();if(!t.id)t.id=uid("todo");t.status=cleanChoice(t.status||t.badge,"할 일",state.todoStatuses);t.owner=state.people.some(p=>p.name===t.owner)?t.owner:state.people[0]?.name||"";t.priority=cleanChoice(t.priority,state.priorities[0],state.priorities);if(!t.due)t.due=t.date||today;t.title=cleanChoice(t.title,"제목 없는 할일");return t}
    assignmentToTodoStatus=function(a){if(a.status==="완료")return"완료";if(a.status==="보류")return"백로그";if(a.status==="진행"||a.status==="검토요청")return"진행중";return"할 일"}
    todoToAssignmentStatus=function(t){if(t.status==="완료")return"완료";if(t.status==="취소")return"보류";if(t.status==="진행중")return"진행";return"지시"}
    renderFilters=function(){ensureConfigLists();const phases=currentView==="construction"?state.constructionPhases:state.phases;els.phaseFilter.innerHTML=`<option value="전체">전체 단계</option>`+phases.map(p=>`<option>${esc(p)}</option>`).join("");$("#projectPhase").innerHTML=state.phases.map(p=>`<option>${esc(p)}</option>`).join("");$("#projectStatus").innerHTML=state.statuses.map(s=>`<option>${esc(s)}</option>`).join("");$("#assignmentOwner").innerHTML=state.people.map(p=>`<option>${esc(p.name)}</option>`).join("")||`<option>담당 미정</option>`;$("#assignmentProject").innerHTML=["일반업무",...state.projects.map(p=>p.name)].map(p=>`<option>${esc(p)}</option>`).join("");$("#assignmentType").innerHTML=state.assignmentTypes.map(v=>`<option>${esc(v)}</option>`).join("");$("#assignmentPriority").innerHTML=state.priorities.map(v=>`<option>${esc(v)}</option>`).join("");$("#assignmentStatus").innerHTML=state.assignmentStatuses.map(s=>`<option>${esc(s)}</option>`).join("");$("#todoStatus").innerHTML=state.todoStatuses.map(s=>`<option>${esc(s)}</option>`).join("");$("#todoPriority").innerHTML=state.priorities.map(v=>`<option>${esc(v)}</option>`).join("");$("#constructionCompany").innerHTML=state.constructionTeams.map(t=>`<option>${esc(t)}</option>`).join("");$("#constructionStructureTeam").innerHTML=state.structureTeams.map(t=>`<option>${esc(t)}</option>`).join("");$("#constructionPhase").innerHTML=state.constructionPhases.map(p=>`<option>${esc(p)}</option>`).join("")}
    function todoListHtml(rows){return `<div class="todo-list"><div class="todo-list-row head"><span>제목</span><span>담당</span><span>상태</span><span>우선</span><span>마감</span><span>관리</span></div>${rows.length?rows.map(({t,i})=>`<div class="todo-list-row"><strong>${esc(t.title)}</strong><span>${esc(t.owner||"담당 미정")}</span><span><span class="badge ${statusClass(t.status)}">${esc(t.status)}</span></span><span>${esc(t.priority||"보통")}</span><span>${esc(t.due||"")}</span><span><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn icon danger" data-delete-todo="${i}">×</button></span></div>`).join(""):`<div class="todo-list-row"><span class="meta">등록된 할일이 없습니다.</span></div>`}</div>`}
    renderTodoBoard=function(){ensureConfigLists();ensureTaskLinks();const panel=$("#todoBoardPanel"),statuses=state.todoStatuses,q=$("#todoSearch")?.value||"",owners=["전체",...state.people.map(p=>p.name)],filtered=state.todos.map((t,i)=>({t:normalizeTodo(t),i})).filter(({t})=>(todoStatusFilter==="전체"||t.status===todoStatusFilter)&&(todoOwnerFilter==="전체"||t.owner===todoOwnerFilter)&&todoMatches(t,q));const chips=`<div class="todo-chips"><button class="todo-chip ${todoStatusFilter==="전체"?"active":""}" data-todo-status-filter="전체">전체 <strong>${state.todos.length}</strong></button>${statuses.map(s=>`<button class="todo-chip ${todoStatusFilter===s?"active":""}" data-todo-status-filter="${esc(s)}">${esc(s)} <strong>${state.todos.filter(t=>normalizeTodo(t).status===s).length}</strong></button>`).join("")}</div><div class="todo-chips">${owners.map(o=>`<button class="todo-chip ${todoOwnerFilter===o?"active":""}" data-todo-owner-filter="${esc(o)}">${esc(o)} <strong>${o==="전체"?state.todos.length:state.todos.filter(t=>t.owner===o).length}</strong></button>`).join("")}</div>`;const board=`<div class="todo-board">${statuses.map(s=>{const rows=filtered.filter(x=>x.t.status===s);return`<div class="todo-column"><div class="todo-column-head"><span>${esc(s)}</span><span class="count">${rows.length}</span></div>${rows.length?rows.map(({t,i})=>`<div class="todo-card ${todoStatusClass(t.status)}"><div class="todo-card-title">${esc(t.title)}</div><div class="todo-card-meta">${esc(t.owner||"담당 미정")} · ${esc(t.priority||"보통")} · ${esc(t.due||"")}</div><div class="todo-card-meta">${esc(t.detail||"")}</div><div class="row-actions" style="margin-top:10px"><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn icon danger" data-delete-todo="${i}">×</button></div></div>`).join(""):`<div class="meta">비어 있음</div>`}<button class="btn" data-add-todo-status="${esc(s)}">+ 빠른 추가</button></div>`}).join("")}</div>`;panel.classList.remove("hidden");panel.innerHTML=`<div class="todo-toolbar"><div class="todo-view"><button class="${todoViewMode==="board"?"active":""}" data-todo-view="board">보드</button><button class="${todoViewMode==="list"?"active":""}" data-todo-view="list">목록</button></div><button class="btn primary" id="todoAddBtn">할일 추가</button></div><div class="todo-filters"><input class="search" id="todoSearch" placeholder="제목, 설명, 담당자, 우선순위 검색" value="${esc(q)}">${chips}</div>${todoViewMode==="list"?todoListHtml(filtered):board}`;$("#todoSearch")?.addEventListener("input",renderTodoBoard)}
    setTimeByDuration=function(min){const startDate=$("#assignmentStart").value||today,startTime=$("#assignmentStartTime").value||"09:00";$("#assignmentStart").value=startDate;$("#assignmentStartTime").value=startTime;const [h,m]=startTime.split(":").map(Number),d=new Date(startDate+"T00:00:00");d.setHours(h||0,m||0,0,0);d.setMinutes(d.getMinutes()+Number(min||60));$("#assignmentDue").value=localDateString(d);$("#assignmentEndTime").value=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");$$("[data-duration-min]").forEach(b=>b.classList.toggle("primary",b.dataset.durationMin===String(min)))}
    googleCalendarUrl=function(a){const start=googleDate(a.start,a.startTime),end=googleDate(a.due,a.endTime,true),details=[a.detail,a.owner?"담당: "+a.owner:"",a.project?"프로젝트: "+a.project:""].filter(Boolean).join("\n");return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(a.title)+"&dates="+encodeURIComponent(start+"/"+end)+"&details="+encodeURIComponent(details)+"&location="+encodeURIComponent(a.location||"")}
    currentAssignmentForm=function(){return{owner:$("#assignmentOwner").value,project:$("#assignmentProject").value,priority:$("#assignmentPriority").value,status:$("#assignmentStatus").value,start:$("#assignmentStart").value||today,due:$("#assignmentDue").value||$("#assignmentStart").value||today,startTime:$("#assignmentStartTime").value||"09:00",endTime:$("#assignmentEndTime").value||"10:00",allDay:$("#assignmentAllDay").checked,repeat:$("#assignmentRepeat").value,location:$("#assignmentLocation").value,type:$("#assignmentType").value,title:$("#assignmentTitle").value||"제목 없는 일정",detail:$("#assignmentDetail").value,result:$("#assignmentResult").value}}
    openAssignmentModal=function(i=null){ensureConfigLists();renderFilters();editingAssignmentIndex=i;const a=i===null?{owner:state.people[0]?.name||"",project:"일반업무",priority:state.priorities[0],status:state.assignmentStatuses[0],start:today,due:today,startTime:"09:00",endTime:"10:00",allDay:false,repeat:"반복 없음",location:"",type:state.assignmentTypes[0],title:"",detail:"",result:""}:normalizeAssignment(state.assignments[i]);$("#assignmentOwner").value=a.owner;$("#assignmentProject").value=a.project;$("#assignmentPriority").value=a.priority;$("#assignmentStatus").value=a.status;$("#assignmentStart").value=a.start||a.due||today;$("#assignmentDue").value=a.due||a.start||today;$("#assignmentStartTime").value=a.startTime||"09:00";$("#assignmentEndTime").value=a.endTime||"10:00";$("#assignmentAllDay").checked=!!a.allDay;$("#assignmentRepeat").value=a.repeat||"반복 없음";$("#assignmentLocation").value=a.location||"";$("#assignmentType").value=a.type;$("#assignmentTitle").value=a.title||"";$("#assignmentDetail").value=a.detail||"";$("#assignmentResult").value=a.result||"";$("#deleteAssignmentInModalBtn").classList.toggle("hidden",i===null);$("#assignmentModal").classList.add("open")}
    assignmentSave=function(){const a=normalizeAssignment(currentAssignmentForm());if(editingAssignmentIndex!==null){a.id=state.assignments[editingAssignmentIndex].id;a.linkedTodoId=state.assignments[editingAssignmentIndex].linkedTodoId}editingAssignmentIndex===null?state.assignments.unshift(a):state.assignments[editingAssignmentIndex]=a;syncAssignmentToTodo(editingAssignmentIndex===null?0:editingAssignmentIndex);setCalendarMonth(els.calendarYear,els.calendarMonth,a.due);setCalendarMonth(els.assignmentCalendarYear,els.assignmentCalendarMonth,a.start||a.due);$("#assignmentModal").classList.remove("open");saveState("일정과 할일을 함께 저장했습니다.");render()}
    $("#saveAssignmentBtn").onclick=assignmentSave;
    adminArrayFor=function(attr){return{"admin-phase":state.phases,"admin-status":state.statuses,"admin-construction-phase":state.constructionPhases,"admin-assignment-status":state.assignmentStatuses,"admin-todo-status":state.todoStatuses,"admin-priority":state.priorities,"admin-assignment-type":state.assignmentTypes,"admin-team":state.constructionTeams,"admin-structure-team":state.structureTeams}[attr]||null}
    adminListHtml=function(list,attr,placeholder){return list.map((v,i)=>`<div class="admin-item single"><input class="field" data-admin-list="${attr}" data-index="${i}" value="${esc(v)}" placeholder="${esc(placeholder)}"><button class="btn icon" data-move-admin-list="${attr}" data-index="${i}" data-dir="-1" ${i===0?"disabled":""}>&uarr;</button><button class="btn icon" data-move-admin-list="${attr}" data-index="${i}" data-dir="1" ${i===list.length-1?"disabled":""}>&darr;</button><button class="btn icon danger" data-delete-admin-list="${attr}" data-index="${i}">&times;</button></div>`).join("")}
    function adminCard(title,attr,placeholder,button){return `<div class="card"><div class="panel-title"><h2>${title}</h2><button class="btn" data-add-admin-list="${attr}" data-placeholder="${esc(placeholder)}">${button}</button></div><div class="admin-list">${adminListHtml(adminArrayFor(attr)||[],attr,placeholder)}</div></div>`}
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.dataset.addAdminList){const arr=adminArrayFor(t.dataset.addAdminList);if(arr){arr.push(t.dataset.placeholder||"새 항목");saveState("항목을 추가했습니다.");render()}}if(t.dataset.deleteAdminList){const arr=adminArrayFor(t.dataset.deleteAdminList);if(arr){arr.splice(Number(t.dataset.index),1);saveState("항목을 삭제했습니다.");render()}}if(t.dataset.addAdminPerson){state.people.push({name:"새 직원",role:"직원",area:"",monthlyTarget:30,yearlyTarget:360});saveState("직원을 추가했습니다.");render()}if(t.dataset.deleteAdminPerson){state.people.splice(Number(t.dataset.deleteAdminPerson),1);saveState("직원을 삭제했습니다.");render()}if(t.dataset.moveAdminPerson){const i=Number(t.dataset.moveAdminPerson),j=i+Number(t.dataset.dir);if(j>=0&&j<state.people.length){[state.people[i],state.people[j]]=[state.people[j],state.people[i]];saveState("순서를 변경했습니다.");render()}}if(t.dataset.addAdminProject){state.projects.push({name:"새 프로젝트"});saveState("프로젝트를 추가했습니다.");render()}if(t.dataset.deleteAdminProject){state.projects.splice(Number(t.dataset.deleteAdminProject),1);saveState("프로젝트를 삭제했습니다.");render()}if(t.dataset.moveAdminProject){const i=Number(t.dataset.moveAdminProject),j=i+Number(t.dataset.dir);if(j>=0&&j<state.projects.length){[state.projects[i],state.projects[j]]=[state.projects[j],state.projects[i]];saveState("순서를 변경했습니다.");render()}}},true)
    document.addEventListener("input",e=>{const t=e.target;if(t.dataset.adminList){const arr=adminArrayFor(t.dataset.adminList);if(arr){arr[Number(t.dataset.index)]=t.value;persistState();renderFilters()}}if(t.dataset.adminPersonName){state.people[Number(t.dataset.adminPersonName)].name=t.value;persistState();renderFilters()}if(t.dataset.adminPersonRole){state.people[Number(t.dataset.adminPersonRole)].role=t.value;persistState()}if(t.dataset.adminProjectName){state.projects[Number(t.dataset.adminProjectName)].name=t.value;persistState();renderFilters()}})
    document.addEventListener("change",e=>{const t=e.target;if(t.id==="assignmentStart"&&!$("#assignmentDue").value)$("#assignmentDue").value=t.value;if(t.id==="assignmentStartTime")setTimeByDuration($$("[data-duration-min].primary")[0]?.dataset.durationMin||60)})
    const pastelPalette=["#8ecae6","#ffb5a7","#b8e0d2","#f6d186","#cdb4db","#a7c7e7","#ffd6a5","#caffbf","#bde0fe","#ffc8dd"];
    function personColor(name){ensureConfigLists();const p=state.people.find(x=>x.name===name);return p?.color||pastelPalette[Math.max(0,state.people.findIndex(x=>x.name===name))%pastelPalette.length]}
    function hexToRgba(hex,a=.18){const h=String(hex||"#8ecae6").replace("#","");const n=parseInt(h.length===3?h.split("").map(c=>c+c).join(""):h,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`}
    function taskPeople(t){return [t.owner,...(Array.isArray(t.helpers)?t.helpers:[])].filter(Boolean)}
    function peopleText(t){const h=(Array.isArray(t.helpers)?t.helpers:[]).filter(Boolean);return h.length?`${t.owner} + ${h.join(", ")}`:t.owner}
    function renderHelperChecks(id,selected=[],owner=""){const box=$("#"+id);if(!box)return;const picked=new Set(selected||[]);box.innerHTML=state.people.filter(p=>p.name!==owner).map(p=>`<label><input type="checkbox" value="${esc(p.name)}" ${picked.has(p.name)?"checked":""}><span class="color-dot" style="background:${esc(p.color||personColor(p.name))}"></span>${esc(p.name)}</label>`).join("")||`<span class="meta">추가 담당자가 없습니다.</span>`}
    function readHelperChecks(id){return Array.from($$("#"+id+" input:checked")).map(x=>x.value)}
    ensureConfigLists=function(){state.todoStatuses=state.todoStatuses&&state.todoStatuses.length?state.todoStatuses:["백로그","할 일","진행중","완료","취소"];state.priorities=state.priorities&&state.priorities.length?state.priorities:["보통","높음","긴급","낮음"];state.assignmentTypes=state.assignmentTypes&&state.assignmentTypes.length?state.assignmentTypes:["일반업무","회의","서류요청","현장확인","인허가","한전","시공","정산"];state.assignmentStatuses=state.assignmentStatuses&&state.assignmentStatuses.length?state.assignmentStatuses:["지시","진행","검토요청","완료","보류"];state.statuses=state.statuses&&state.statuses.length?state.statuses:["정상","대기","보완","지연","완료"];state.people=state.people&&state.people.length?state.people:[{name:"이재강",role:"과장",area:"담당업무 미입력",monthlyTarget:30,yearlyTarget:360}];state.people.forEach((p,i)=>{if(!p.color)p.color=pastelPalette[i%pastelPalette.length]});state.projects=(state.projects||[]).map(p=>typeof p==="string"?{name:p}:p);if(!state.people.some(p=>p.name===assignmentPersonFilter))assignmentPersonFilter="전체";if(!state.people.some(p=>p.name===todoOwnerFilter))todoOwnerFilter="전체";if(!state.todoStatuses.includes(todoStatusFilter))todoStatusFilter="전체"}
    normalizeAssignment=function(a){ensureConfigLists();if(!a.id)a.id=uid("assignment");if(!a.start)a.start=a.due||today;if(!a.due)a.due=a.start||today;a.priority=cleanChoice(a.priority,state.priorities[0],state.priorities);a.status=cleanChoice(a.status,state.assignmentStatuses[0],state.assignmentStatuses);a.type=cleanChoice(a.type,state.assignmentTypes[0],state.assignmentTypes);a.project=cleanChoice(a.project,"일반업무");a.title=cleanChoice(a.title,"제목 없는 일정");a.helpers=Array.isArray(a.helpers)?a.helpers.filter(x=>x&&x!==a.owner):[];if(!a.startTime)a.startTime="09:00";if(!a.endTime)a.endTime="10:00";a.repeat=cleanChoice(a.repeat,"반복 없음");return a}
    normalizeTodo=function(t){ensureConfigLists();if(!t.id)t.id=uid("todo");t.status=cleanChoice(t.status||t.badge,"할 일",state.todoStatuses);t.owner=state.people.some(p=>p.name===t.owner)?t.owner:state.people[0]?.name||"";t.priority=cleanChoice(t.priority,state.priorities[0],state.priorities);t.type=cleanChoice(t.type,state.assignmentTypes[0],state.assignmentTypes);t.project=cleanChoice(t.project,"일반업무");t.start=t.start||t.due||today;if(!t.due)t.due=t.date||today;t.startTime=t.startTime||"09:00";t.endTime=t.endTime||"10:00";t.repeat=cleanChoice(t.repeat,"반복 없음");t.location=t.location||"";t.result=t.result||"";t.helpers=Array.isArray(t.helpers)?t.helpers.filter(x=>x&&x!==t.owner):[];t.title=cleanChoice(t.title,"제목 없는 할일");return t}
    assignmentToTodo=function(a,old={}){a=normalizeAssignment(a);return{...old,id:a.linkedTodoId||old.id||uid("todo"),linkedAssignmentId:a.id,title:a.title,owner:a.owner,helpers:[...(a.helpers||[])],status:assignmentToTodoStatus(a),priority:a.priority,due:a.due,detail:a.detail||a.result||"",project:a.project,type:a.type,start:a.start,startTime:a.startTime,endTime:a.endTime,allDay:a.allDay,repeat:a.repeat,location:a.location,result:a.result||""}}
    todoToAssignment=function(t,old={}){t=normalizeTodo(t);return{...old,id:t.linkedAssignmentId||old.id||uid("assignment"),linkedTodoId:t.id,owner:t.owner,helpers:[...(t.helpers||[])],project:t.project||"일반업무",priority:t.priority,status:todoToAssignmentStatus(t),start:t.start||t.due||today,due:t.due||today,startTime:t.startTime||"09:00",endTime:t.endTime||"10:00",allDay:!!t.allDay,repeat:t.repeat||"반복 없음",location:t.location||"",type:t.type||"일반업무",title:t.title,detail:t.detail||"",result:t.result||""}}
    renderFilters=function(){ensureConfigLists();const phases=currentView==="construction"?state.constructionPhases:state.phases;els.phaseFilter.innerHTML=`<option value="전체">전체 단계</option>`+phases.map(p=>`<option>${esc(p)}</option>`).join("");$("#projectPhase").innerHTML=state.phases.map(p=>`<option>${esc(p)}</option>`).join("");$("#projectStatus").innerHTML=state.statuses.map(s=>`<option>${esc(s)}</option>`).join("");const projectOptions=["일반업무",...state.projects.map(p=>p.name)].map(p=>`<option>${esc(p)}</option>`).join("");$("#assignmentOwner").innerHTML=state.people.map(p=>`<option>${esc(p.name)}</option>`).join("")||`<option>담당 미정</option>`;$("#todoOwner").innerHTML=$("#assignmentOwner").innerHTML;$("#assignmentProject").innerHTML=projectOptions;if($("#todoProject"))$("#todoProject").innerHTML=projectOptions;$("#assignmentType").innerHTML=state.assignmentTypes.map(v=>`<option>${esc(v)}</option>`).join("");if($("#todoType"))$("#todoType").innerHTML=$("#assignmentType").innerHTML;$("#assignmentPriority").innerHTML=state.priorities.map(v=>`<option>${esc(v)}</option>`).join("");$("#todoPriority").innerHTML=$("#assignmentPriority").innerHTML;$("#assignmentStatus").innerHTML=state.assignmentStatuses.map(s=>`<option>${esc(s)}</option>`).join("");$("#todoStatus").innerHTML=state.todoStatuses.map(s=>`<option>${esc(s)}</option>`).join("");$("#constructionCompany").innerHTML=state.constructionTeams.map(t=>`<option>${esc(t)}</option>`).join("");$("#constructionStructureTeam").innerHTML=state.structureTeams.map(t=>`<option>${esc(t)}</option>`).join("");$("#constructionPhase").innerHTML=state.constructionPhases.map(p=>`<option>${esc(p)}</option>`).join("")}
    function setTodoTimeByDuration(min){const startDate=$("#todoStart").value||today,startTime=$("#todoStartTime").value||"09:00";$("#todoStart").value=startDate;$("#todoStartTime").value=startTime;const [h,m]=startTime.split(":").map(Number),d=new Date(startDate+"T00:00:00");d.setHours(h||0,m||0,0,0);d.setMinutes(d.getMinutes()+Number(min||60));$("#todoDue").value=localDateString(d);$("#todoEndTime").value=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");$$("[data-todo-duration-min]").forEach(b=>b.classList.toggle("primary",b.dataset.todoDurationMin===String(min)))}
    openTodoModal=function(i=null,status="할 일"){ensureConfigLists();renderFilters();editingTodoIndex=i;const t=i===null?{title:"",owner:state.people[0]?.name||"",helpers:[],project:"일반업무",type:state.assignmentTypes[0],status,priority:state.priorities[0],start:today,due:today,startTime:"09:00",endTime:"10:00",allDay:false,repeat:"반복 없음",location:"",detail:"",result:""}:normalizeTodo(state.todos[i]);$("#todoTitle").value=t.title||"";$("#todoOwner").value=t.owner;$("#todoProject").value=t.project||"일반업무";$("#todoType").value=t.type||state.assignmentTypes[0];$("#todoStatus").value=t.status||"할 일";$("#todoPriority").value=t.priority||state.priorities[0];$("#todoStart").value=t.start||t.due||today;$("#todoDue").value=t.due||today;$("#todoStartTime").value=t.startTime||"09:00";$("#todoEndTime").value=t.endTime||"10:00";$("#todoAllDay").checked=!!t.allDay;$("#todoRepeat").value=t.repeat||"반복 없음";$("#todoLocation").value=t.location||"";$("#todoDetail").value=t.detail||"";$("#todoResult").value=t.result||"";renderHelperChecks("todoHelpers",t.helpers,t.owner);$("#deleteTodoInModalBtn").classList.toggle("hidden",i===null);$("#todoModal").classList.add("open")}
    currentAssignmentForm=function(){return{owner:$("#assignmentOwner").value,helpers:readHelperChecks("assignmentHelpers"),project:$("#assignmentProject").value,priority:$("#assignmentPriority").value,status:$("#assignmentStatus").value,start:$("#assignmentStart").value||today,due:$("#assignmentDue").value||$("#assignmentStart").value||today,startTime:$("#assignmentStartTime").value||"09:00",endTime:$("#assignmentEndTime").value||"10:00",allDay:$("#assignmentAllDay").checked,repeat:$("#assignmentRepeat").value,location:$("#assignmentLocation").value,type:$("#assignmentType").value,title:$("#assignmentTitle").value||"제목 없는 일정",detail:$("#assignmentDetail").value,result:$("#assignmentResult").value}}
    openAssignmentModal=function(i=null){ensureConfigLists();renderFilters();editingAssignmentIndex=i;const a=i===null?{owner:state.people[0]?.name||"",helpers:[],project:"일반업무",priority:state.priorities[0],status:state.assignmentStatuses[0],start:today,due:today,startTime:"09:00",endTime:"10:00",allDay:false,repeat:"반복 없음",location:"",type:state.assignmentTypes[0],title:"",detail:"",result:""}:normalizeAssignment(state.assignments[i]);$("#assignmentOwner").value=a.owner;$("#assignmentProject").value=a.project;$("#assignmentPriority").value=a.priority;$("#assignmentStatus").value=a.status;$("#assignmentStart").value=a.start||a.due||today;$("#assignmentDue").value=a.due||a.start||today;$("#assignmentStartTime").value=a.startTime||"09:00";$("#assignmentEndTime").value=a.endTime||"10:00";$("#assignmentAllDay").checked=!!a.allDay;$("#assignmentRepeat").value=a.repeat||"반복 없음";$("#assignmentLocation").value=a.location||"";$("#assignmentType").value=a.type;$("#assignmentTitle").value=a.title||"";$("#assignmentDetail").value=a.detail||"";$("#assignmentResult").value=a.result||"";renderHelperChecks("assignmentHelpers",a.helpers,a.owner);$("#deleteAssignmentInModalBtn").classList.toggle("hidden",i===null);$("#assignmentModal").classList.add("open")}
    $("#saveTodoBtn").onclick=()=>{const t=normalizeTodo({title:$("#todoTitle").value||"제목 없는 할일",owner:$("#todoOwner").value,helpers:readHelperChecks("todoHelpers"),project:$("#todoProject").value,type:$("#todoType").value,status:$("#todoStatus").value,priority:$("#todoPriority").value,start:$("#todoStart").value||today,due:$("#todoDue").value||today,startTime:$("#todoStartTime").value||"09:00",endTime:$("#todoEndTime").value||"10:00",allDay:$("#todoAllDay").checked,repeat:$("#todoRepeat").value,location:$("#todoLocation").value,detail:$("#todoDetail").value,result:$("#todoResult").value});if(editingTodoIndex!==null){t.id=state.todos[editingTodoIndex].id;t.linkedAssignmentId=state.todos[editingTodoIndex].linkedAssignmentId}editingTodoIndex===null?state.todos.unshift(t):state.todos[editingTodoIndex]=t;syncTodoToAssignment(editingTodoIndex===null?0:editingTodoIndex);setCalendarMonth(els.calendarYear,els.calendarMonth,t.due);setCalendarMonth(els.assignmentCalendarYear,els.assignmentCalendarMonth,t.start||t.due);$("#todoModal").classList.remove("open");saveState("할일과 일정을 함께 저장했습니다.");render()}
    assignmentTaskHtml=function(t){const i=state.assignments.indexOf(t),c=personColor(t.owner);return `<div class="calendar-task" style="border-left-color:${esc(c)};background:${esc(hexToRgba(c,.22))}" data-open-assignment="${i}" title="${esc(t.detail||t.title)}"><span class="color-dot" style="background:${esc(c)}"></span>${esc(peopleText(t))} · ${esc(t.title)}<br>${esc(t.status)} · ${esc(t.priority)}</div>`}
    renderAssignmentPeopleChips=function(){const people=["전체",...state.people.map(p=>p.name)],counts=Object.fromEntries(people.map(p=>[p,p==="전체"?state.assignments.length:state.assignments.filter(a=>taskPeople(a).includes(p)).length]));$("#assignmentPeopleChips").innerHTML=people.map(p=>`<button class="person-chip ${assignmentPersonFilter===p?"active":""}" data-assignment-person="${esc(p)}">${p==="전체"?"":`<span class="color-dot" style="background:${esc(personColor(p))}"></span>`}${esc(p)} <strong>${counts[p]||0}</strong></button>`).join("")}
    renderAssignmentCalendar=function(){renderAssignmentPeopleChips();renderScheduleViewButtons();const y=Number(els.assignmentCalendarYear.value),m=Number(els.assignmentCalendarMonth.value)-1,first=new Date(y,m,1),start=new Date(first);start.setDate(1-first.getDay());const names=["일","월","화","수","목","금","토"],days=assignmentCalendarView==="month"?42:assignmentCalendarView==="week"?7:1;let html=(assignmentCalendarView==="day"?["일정"]:names).map(n=>`<div class="day-name">${n}</div>`).join("");for(let i=0;i<days;i++){const d=assignmentCalendarView==="day"?new Date(y,m,1):new Date(start);if(assignmentCalendarView!=="day")d.setDate(start.getDate()+i);const iso=localDateString(d),tasks=state.assignments.filter(a=>(assignmentPersonFilter==="전체"||taskPeople(a).includes(assignmentPersonFilter))&&(a.start===iso||a.due===iso));html+=`<div class="day-cell ${d.getMonth()!==m?"muted":""}"><div class="day-number">${d.getDate()}</div>${tasks.map(assignmentTaskHtml).join("")}</div>`}els.assignmentCalendarGrid.style.gridTemplateColumns=assignmentCalendarView==="day"?"1fr":"repeat(7,minmax(0,1fr))";els.assignmentCalendarGrid.innerHTML=html}
    function todoCardStyle(t){const c=personColor(t.owner);return `border-left-color:${c};background:${hexToRgba(c,.14)}`}
    todoListHtml=function(rows){return `<div class="todo-list"><div class="todo-list-row head"><span>제목</span><span>담당</span><span>상태</span><span>우선</span><span>마감</span><span>관리</span></div>${rows.length?rows.map(({t,i})=>`<div class="todo-list-row" style="border-left:5px solid ${esc(personColor(t.owner))}"><strong>${esc(t.title)}</strong><span>${esc(peopleText(t))}</span><span><span class="badge ${statusClass(t.status)}">${esc(t.status)}</span></span><span>${esc(t.priority||"보통")}</span><span>${esc(t.due||"")}</span><span><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn icon danger" data-delete-todo="${i}">×</button></span></div>`).join(""):`<div class="todo-list-row"><span class="meta">등록된 할일이 없습니다.</span></div>`}</div>`}
    renderTodoBoard=function(){ensureConfigLists();ensureTaskLinks();const panel=$("#todoBoardPanel"),statuses=state.todoStatuses,q=$("#todoSearch")?.value||"",owners=["전체",...state.people.map(p=>p.name)],filtered=state.todos.map((t,i)=>({t:normalizeTodo(t),i})).filter(({t})=>(todoStatusFilter==="전체"||t.status===todoStatusFilter)&&(todoOwnerFilter==="전체"||taskPeople(t).includes(todoOwnerFilter))&&todoMatches(t,q));const chips=`<div class="todo-chips"><button class="todo-chip ${todoStatusFilter==="전체"?"active":""}" data-todo-status-filter="전체">전체 <strong>${state.todos.length}</strong></button>${statuses.map(s=>`<button class="todo-chip ${todoStatusFilter===s?"active":""}" data-todo-status-filter="${esc(s)}">${esc(s)} <strong>${state.todos.filter(t=>normalizeTodo(t).status===s).length}</strong></button>`).join("")}</div><div class="todo-chips">${owners.map(o=>`<button class="todo-chip ${todoOwnerFilter===o?"active":""}" data-todo-owner-filter="${esc(o)}">${o==="전체"?"":`<span class="color-dot" style="background:${esc(personColor(o))}"></span>`}${esc(o)} <strong>${o==="전체"?state.todos.length:state.todos.filter(t=>taskPeople(t).includes(o)).length}</strong></button>`).join("")}</div>`;const board=`<div class="todo-board">${statuses.map(s=>{const rows=filtered.filter(x=>x.t.status===s);return`<div class="todo-column"><div class="todo-column-head"><span>${esc(s)}</span><span class="count">${rows.length}</span></div>${rows.length?rows.map(({t,i})=>`<div class="todo-card ${todoStatusClass(t.status)}" style="${esc(todoCardStyle(t))}"><div class="todo-card-title">${esc(t.title)}</div><div class="todo-card-meta"><span class="color-dot" style="background:${esc(personColor(t.owner))}"></span>${esc(peopleText(t))} · ${esc(t.priority||"보통")} · ${esc(t.due||"")}</div><div class="todo-card-meta">${esc(t.project||"일반업무")} · ${esc(t.type||"일반업무")}</div><div class="todo-card-meta">${esc(t.detail||"")}</div><div class="row-actions" style="margin-top:10px"><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn icon danger" data-delete-todo="${i}">×</button></div></div>`).join(""):`<div class="meta">비어 있음</div>`}<button class="btn" data-add-todo-status="${esc(s)}">+ 빠른 추가</button></div>`}).join("")}</div>`;panel.classList.remove("hidden");panel.innerHTML=`<div class="todo-toolbar"><div class="todo-view"><button class="${todoViewMode==="board"?"active":""}" data-todo-view="board">보드</button><button class="${todoViewMode==="list"?"active":""}" data-todo-view="list">목록</button></div><button class="btn primary" id="todoAddBtn">할일 추가</button></div><div class="todo-filters"><input class="search" id="todoSearch" placeholder="제목, 설명, 담당자, 우선순위 검색" value="${esc(q)}">${chips}</div>${todoViewMode==="list"?todoListHtml(filtered):board}`;$("#todoSearch")?.addEventListener("input",renderTodoBoard)}
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.hasAttribute?.("data-add-admin-person")){e.preventDefault();e.stopImmediatePropagation();state.people.push({name:"새 직원",role:"직원",area:"",monthlyTarget:30,yearlyTarget:360,color:pastelPalette[state.people.length%pastelPalette.length]});saveState("직원을 추가했습니다.");render()}if(t.hasAttribute?.("data-add-admin-project")){e.preventDefault();e.stopImmediatePropagation();state.projects.push({name:"새 프로젝트"});saveState("프로젝트를 추가했습니다.");render()}if(t.dataset.todoDurationMin){setTodoTimeByDuration(t.dataset.todoDurationMin)}},true)
    document.addEventListener("input",e=>{const t=e.target;if(t.dataset.adminPersonColor){state.people[Number(t.dataset.adminPersonColor)].color=t.value;persistState();renderFilters()}},true)
    document.addEventListener("change",e=>{const t=e.target;if(t.id==="assignmentOwner")renderHelperChecks("assignmentHelpers",readHelperChecks("assignmentHelpers"),t.value);if(t.id==="todoOwner")renderHelperChecks("todoHelpers",readHelperChecks("todoHelpers"),t.value);if(t.id==="todoStart"&&!$("#todoDue").value)$("#todoDue").value=t.value;if(t.id==="todoStartTime")setTodoTimeByDuration($$("[data-todo-duration-min].primary")[0]?.dataset.todoDurationMin||60)},true)
    const KR={all:"전체",todo:"할 일",backlog:"백로그",doing:"진행중",done:"완료",cancel:"취소",normal:"보통",high:"높음",urgent:"긴급",low:"낮음",general:"일반업무",meeting:"회의",doc:"서류요청",site:"현장확인",permit:"인허가",kepco:"한전",build:"시공",settle:"정산",order:"지시",progress:"진행",review:"검토요청",hold:"보류",emptyTodo:"제목 없는 할일",emptySchedule:"제목 없는 일정",noOwner:"담당 미정",repeatNone:"반복 없음",newEmployee:"새 직원",employee:"직원",newProject:"새 프로젝트"};
    const isBrokenText=v=>!v||/[?��諛吏꾩쒕꾨쇰]/.test(String(v));
    function fixedList(list,fallback){return Array.isArray(list)&&list.length&&!list.some(isBrokenText)?list:fallback.slice()}
    ensureConfigLists=function(){
      state.todoStatuses=fixedList(state.todoStatuses,[KR.backlog,KR.todo,KR.doing,KR.done,KR.cancel]);
      state.priorities=fixedList(state.priorities,[KR.normal,KR.high,KR.urgent,KR.low]);
      state.assignmentTypes=fixedList(state.assignmentTypes,[KR.general,KR.meeting,KR.doc,KR.site,KR.permit,KR.kepco,KR.build,KR.settle]);
      state.assignmentStatuses=fixedList(state.assignmentStatuses,[KR.order,KR.progress,KR.review,KR.done,KR.hold]);
      state.statuses=fixedList(state.statuses,["정상","대기","보완","지연",KR.done]);
      state.people=Array.isArray(state.people)&&state.people.length?state.people:[{name:"이재강",role:"과장",area:"담당업무 미입력",monthlyTarget:30,yearlyTarget:360}];
      state.people.forEach((p,i)=>{if(isBrokenText(p.name))p.name=KR.newEmployee;if(isBrokenText(p.role))p.role=KR.employee;if(!p.color)p.color=pastelPalette[i%pastelPalette.length]});
      state.projects=(state.projects||[]).map(p=>typeof p==="string"?{name:p}:p).filter(Boolean);
      state.projects.forEach(p=>{if(isBrokenText(p.name))p.name=KR.newProject});
      if(!state.people.some(p=>p.name===assignmentPersonFilter))assignmentPersonFilter=KR.all;
      if(!state.people.some(p=>p.name===todoOwnerFilter))todoOwnerFilter=KR.all;
      if(!state.todoStatuses.includes(todoStatusFilter))todoStatusFilter=KR.all;
      if(!Array.isArray(state.constructionTeams)||!state.constructionTeams.length)state.constructionTeams=["남해","다온","다호","동광","금태양","JW","보강"];
      ["금태양","JW","보강"].forEach(c=>{if(!state.constructionTeams.includes(c))state.constructionTeams.push(c)});
      if(!Array.isArray(state.constructionPhases)||!state.constructionPhases.length)state.constructionPhases=["자재입고완료","구조물시공","전기시공","보강공사","완료"];
      if(!state.constructionPhases.includes("보강공사")){const i=state.constructionPhases.indexOf("완료");i>=0?state.constructionPhases.splice(i,0,"보강공사"):state.constructionPhases.push("보강공사")}
    }
    normalizeAssignment=function(a){ensureConfigLists();if(!a.id)a.id=uid("assignment");a.owner=state.people.some(p=>p.name===a.owner)?a.owner:state.people[0]?.name||"";a.helpers=Array.isArray(a.helpers)?a.helpers.filter(x=>x&&x!==a.owner&&!isBrokenText(x)):[];a.start=a.start||a.due||today;a.due=a.due||a.start||today;a.startTime=a.startTime||"09:00";a.endTime=a.endTime||"10:00";a.priority=cleanChoice(a.priority,state.priorities[0],state.priorities);a.status=cleanChoice(a.status,state.assignmentStatuses[0],state.assignmentStatuses);a.type=cleanChoice(a.type,state.assignmentTypes[0],state.assignmentTypes);a.project=isBrokenText(a.project)?KR.general:a.project;a.title=isBrokenText(a.title)?KR.emptySchedule:a.title;a.repeat=isBrokenText(a.repeat)?KR.repeatNone:a.repeat;return a}
    normalizeTodo=function(t){ensureConfigLists();if(!t.id)t.id=uid("todo");t.owner=state.people.some(p=>p.name===t.owner)?t.owner:state.people[0]?.name||"";t.helpers=Array.isArray(t.helpers)?t.helpers.filter(x=>x&&x!==t.owner&&!isBrokenText(x)):[];t.status=cleanChoice(t.status||t.badge,KR.todo,state.todoStatuses);t.priority=cleanChoice(t.priority,state.priorities[0],state.priorities);t.type=cleanChoice(t.type,state.assignmentTypes[0],state.assignmentTypes);t.project=isBrokenText(t.project)?KR.general:t.project;t.start=t.start||t.due||today;t.due=t.due||t.date||today;t.startTime=t.startTime||"09:00";t.endTime=t.endTime||"10:00";t.repeat=isBrokenText(t.repeat)?KR.repeatNone:t.repeat;t.location=t.location||"";t.result=t.result||"";t.title=isBrokenText(t.title)?KR.emptyTodo:t.title;return t}
    assignmentToTodoStatus=function(a){if(a.status===KR.done)return KR.done;if(a.status===KR.hold)return KR.backlog;if(a.status===KR.progress||a.status===KR.review)return KR.doing;return KR.todo}
    todoToAssignmentStatus=function(t){if(t.status===KR.done)return KR.done;if(t.status===KR.cancel)return KR.hold;if(t.status===KR.doing)return KR.progress;return KR.order}
    assignmentToTodo=function(a,old={}){a=normalizeAssignment(a);return{...old,id:a.linkedTodoId||old.id||uid("todo"),linkedAssignmentId:a.id,title:a.title,owner:a.owner,helpers:[...(a.helpers||[])],status:assignmentToTodoStatus(a),priority:a.priority,due:a.due,detail:a.detail||a.result||"",project:a.project,type:a.type,start:a.start,startTime:a.startTime,endTime:a.endTime,allDay:a.allDay,repeat:a.repeat,location:a.location,result:a.result||""}}
    todoToAssignment=function(t,old={}){t=normalizeTodo(t);return{...old,id:t.linkedAssignmentId||old.id||uid("assignment"),linkedTodoId:t.id,owner:t.owner,helpers:[...(t.helpers||[])],project:t.project||KR.general,priority:t.priority,status:todoToAssignmentStatus(t),start:t.start||t.due||today,due:t.due||today,startTime:t.startTime||"09:00",endTime:t.endTime||"10:00",allDay:!!t.allDay,repeat:t.repeat||KR.repeatNone,location:t.location||"",type:t.type||KR.general,title:t.title,detail:t.detail||"",result:t.result||""}}
    renderHelperChecks=function(id,selected=[],owner=""){const box=$("#"+id);if(!box)return;ensureConfigLists();const picked=new Set(selected||[]);box.innerHTML=state.people.filter(p=>p.name!==owner).map(p=>`<label><input type="checkbox" value="${esc(p.name)}" ${picked.has(p.name)?"checked":""}><span class="color-dot" style="background:${esc(p.color||personColor(p.name))}"></span>${esc(p.name)}</label>`).join("")||`<span class="meta">추가 담당자가 없습니다.</span>`}
    renderFilters=function(){ensureConfigLists();const phases=currentView==="construction"?state.constructionPhases:state.phases;els.phaseFilter.innerHTML=`<option value="${KR.all}">${KR.all} 단계</option>`+phases.map(p=>`<option>${esc(p)}</option>`).join("");$("#projectPhase").innerHTML=state.phases.map(p=>`<option>${esc(p)}</option>`).join("");$("#projectStatus").innerHTML=state.statuses.map(s=>`<option>${esc(s)}</option>`).join("");const projectOptions=[KR.general,...state.projects.map(p=>p.name)].map(p=>`<option>${esc(p)}</option>`).join("");$("#assignmentOwner").innerHTML=state.people.map(p=>`<option>${esc(p.name)}</option>`).join("")||`<option>${KR.noOwner}</option>`;$("#todoOwner").innerHTML=$("#assignmentOwner").innerHTML;$("#assignmentProject").innerHTML=projectOptions;if($("#todoProject"))$("#todoProject").innerHTML=projectOptions;$("#assignmentType").innerHTML=state.assignmentTypes.map(v=>`<option>${esc(v)}</option>`).join("");if($("#todoType"))$("#todoType").innerHTML=$("#assignmentType").innerHTML;$("#assignmentPriority").innerHTML=state.priorities.map(v=>`<option>${esc(v)}</option>`).join("");$("#todoPriority").innerHTML=$("#assignmentPriority").innerHTML;$("#assignmentStatus").innerHTML=state.assignmentStatuses.map(s=>`<option>${esc(s)}</option>`).join("");$("#todoStatus").innerHTML=state.todoStatuses.map(s=>`<option>${esc(s)}</option>`).join("");$("#constructionCompany").innerHTML=state.constructionTeams.map(t=>`<option>${esc(t)}</option>`).join("");$("#constructionStructureTeam").innerHTML=state.structureTeams.map(t=>`<option>${esc(t)}</option>`).join("");$("#constructionPhase").innerHTML=state.constructionPhases.map(p=>`<option>${esc(p)}</option>`).join("")}
    openTodoModal=function(i=null,status=KR.todo){ensureConfigLists();renderFilters();editingTodoIndex=i;const t=i===null?{title:"",owner:state.people[0]?.name||"",helpers:[],project:KR.general,type:state.assignmentTypes[0],status,priority:state.priorities[0],start:today,due:today,startTime:"09:00",endTime:"10:00",allDay:false,repeat:KR.repeatNone,location:"",detail:"",result:""}:normalizeTodo(state.todos[i]);$("#todoTitle").value=t.title||"";$("#todoOwner").value=t.owner;$("#todoProject").value=t.project||KR.general;$("#todoType").value=t.type||state.assignmentTypes[0];$("#todoStatus").value=t.status||KR.todo;$("#todoPriority").value=t.priority||state.priorities[0];$("#todoStart").value=t.start||t.due||today;$("#todoDue").value=t.due||today;$("#todoStartTime").value=t.startTime||"09:00";$("#todoEndTime").value=t.endTime||"10:00";$("#todoAllDay").checked=!!t.allDay;$("#todoRepeat").value=t.repeat||KR.repeatNone;$("#todoLocation").value=t.location||"";$("#todoDetail").value=t.detail||"";$("#todoResult").value=t.result||"";renderHelperChecks("todoHelpers",t.helpers,t.owner);$("#deleteTodoInModalBtn").classList.toggle("hidden",i===null);$("#todoModal").classList.add("open")}
    currentAssignmentForm=function(){return{owner:$("#assignmentOwner").value,helpers:readHelperChecks("assignmentHelpers"),project:$("#assignmentProject").value,priority:$("#assignmentPriority").value,status:$("#assignmentStatus").value,start:$("#assignmentStart").value||today,due:$("#assignmentDue").value||$("#assignmentStart").value||today,startTime:$("#assignmentStartTime").value||"09:00",endTime:$("#assignmentEndTime").value||"10:00",allDay:$("#assignmentAllDay").checked,repeat:$("#assignmentRepeat").value,location:$("#assignmentLocation").value,type:$("#assignmentType").value,title:$("#assignmentTitle").value||KR.emptySchedule,detail:$("#assignmentDetail").value,result:$("#assignmentResult").value}}
    openAssignmentModal=function(i=null){ensureConfigLists();renderFilters();editingAssignmentIndex=i;const a=i===null?{owner:state.people[0]?.name||"",helpers:[],project:KR.general,priority:state.priorities[0],status:state.assignmentStatuses[0],start:today,due:today,startTime:"09:00",endTime:"10:00",allDay:false,repeat:KR.repeatNone,location:"",type:state.assignmentTypes[0],title:"",detail:"",result:""}:normalizeAssignment(state.assignments[i]);$("#assignmentOwner").value=a.owner;$("#assignmentProject").value=a.project;$("#assignmentPriority").value=a.priority;$("#assignmentStatus").value=a.status;$("#assignmentStart").value=a.start||a.due||today;$("#assignmentDue").value=a.due||a.start||today;$("#assignmentStartTime").value=a.startTime||"09:00";$("#assignmentEndTime").value=a.endTime||"10:00";$("#assignmentAllDay").checked=!!a.allDay;$("#assignmentRepeat").value=a.repeat||KR.repeatNone;$("#assignmentLocation").value=a.location||"";$("#assignmentType").value=a.type;$("#assignmentTitle").value=a.title||"";$("#assignmentDetail").value=a.detail||"";$("#assignmentResult").value=a.result||"";renderHelperChecks("assignmentHelpers",a.helpers,a.owner);$("#deleteAssignmentInModalBtn").classList.toggle("hidden",i===null);$("#assignmentModal").classList.add("open")}
    assignmentSave=function(){const a=normalizeAssignment(currentAssignmentForm());if(editingAssignmentIndex!==null){a.id=state.assignments[editingAssignmentIndex].id;a.linkedTodoId=state.assignments[editingAssignmentIndex].linkedTodoId}editingAssignmentIndex===null?state.assignments.unshift(a):state.assignments[editingAssignmentIndex]=a;syncAssignmentToTodo(editingAssignmentIndex===null?0:editingAssignmentIndex);setCalendarMonth(els.calendarYear,els.calendarMonth,a.due);setCalendarMonth(els.assignmentCalendarYear,els.assignmentCalendarMonth,a.start||a.due);$("#assignmentModal").classList.remove("open");saveState("일정과 할일을 함께 저장했습니다.");render()}
    $("#saveAssignmentBtn").onclick=assignmentSave;
    $("#saveTodoBtn").onclick=()=>{const prev=editingTodoIndex!==null?state.todos[editingTodoIndex]:{};const t=normalizeTodo({title:$("#todoTitle").value||KR.emptyTodo,owner:$("#todoOwner").value,helpers:readHelperChecks("todoHelpers"),project:$("#todoProject").value,type:$("#todoType").value,status:$("#todoStatus").value,priority:$("#todoPriority").value,start:$("#todoStart").value||today,due:$("#todoDue").value||today,startTime:$("#todoStartTime").value||"09:00",endTime:$("#todoEndTime").value||"10:00",allDay:$("#todoAllDay").checked,repeat:$("#todoRepeat").value,location:$("#todoLocation").value,detail:$("#todoDetail").value,result:$("#todoResult").value,kakaoSharedAt:prev.kakaoSharedAt,kakaoSharedBy:prev.kakaoSharedBy});if(editingTodoIndex!==null){t.id=state.todos[editingTodoIndex].id;t.linkedAssignmentId=state.todos[editingTodoIndex].linkedAssignmentId}editingTodoIndex===null?state.todos.unshift(t):state.todos[editingTodoIndex]=t;syncTodoToAssignment(editingTodoIndex===null?0:editingTodoIndex);setCalendarMonth(els.calendarYear,els.calendarMonth,t.due);setCalendarMonth(els.assignmentCalendarYear,els.assignmentCalendarMonth,t.start||t.due);$("#todoModal").classList.remove("open");saveState("할일과 일정을 함께 저장했습니다.");render()}
    $("#deleteAssignmentInModalBtn").onclick=()=>{if(editingAssignmentIndex!==null&&confirm("이 일정을 삭제할까요?")){deleteAssignmentAt(editingAssignmentIndex);$("#assignmentModal").classList.remove("open");saveState("일정을 삭제했습니다.");render()}}
    $("#deleteTodoInModalBtn").onclick=()=>{if(editingTodoIndex!==null&&confirm("이 할일을 삭제할까요?")){deleteTodoAt(editingTodoIndex);$("#todoModal").classList.remove("open");saveState("할일을 삭제했습니다.");render()}}
    todoListHtml=function(rows){return `<div class="todo-list"><div class="todo-list-row head"><span>제목</span><span>담당</span><span>상태</span><span>우선</span><span>마감</span><span>관리</span></div>${rows.length?rows.map(({t,i})=>`<div class="todo-list-row" style="border-left:5px solid ${esc(personColor(t.owner))}"><strong>${esc(t.title)}</strong><span>${esc(peopleText(t))}</span><span><span class="badge ${statusClass(t.status)}">${esc(t.status)}</span></span><span>${esc(t.priority||KR.normal)}</span><span>${esc(t.due||"")}</span><span><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn icon danger" data-delete-todo="${i}">×</button></span></div>`).join(""):`<div class="todo-list-row"><span class="meta">등록된 할일이 없습니다.</span></div>`}</div>`}
    renderTodoBoard=function(){ensureConfigLists();ensureTaskLinks();const panel=$("#todoBoardPanel"),statuses=state.todoStatuses,q=$("#todoSearch")?.value||"",owners=[KR.all,...state.people.map(p=>p.name)],filtered=state.todos.map((t,i)=>({t:normalizeTodo(t),i})).filter(({t})=>(todoStatusFilter===KR.all||t.status===todoStatusFilter)&&(todoOwnerFilter===KR.all||taskPeople(t).includes(todoOwnerFilter))&&todoMatches(t,q));const chips=`<div class="todo-chips"><button class="todo-chip ${todoStatusFilter===KR.all?"active":""}" data-todo-status-filter="${KR.all}">${KR.all} <strong>${state.todos.length}</strong></button>${statuses.map(s=>`<button class="todo-chip ${todoStatusFilter===s?"active":""}" data-todo-status-filter="${esc(s)}">${esc(s)} <strong>${state.todos.filter(t=>normalizeTodo(t).status===s).length}</strong></button>`).join("")}</div><div class="todo-chips">${owners.map(o=>`<button class="todo-chip ${todoOwnerFilter===o?"active":""}" data-todo-owner-filter="${esc(o)}">${o===KR.all?"":`<span class="color-dot" style="background:${esc(personColor(o))}"></span>`}${esc(o)} <strong>${o===KR.all?state.todos.length:state.todos.filter(t=>taskPeople(t).includes(o)).length}</strong></button>`).join("")}</div>`;const board=`<div class="todo-board">${statuses.map(s=>{const rows=filtered.filter(x=>x.t.status===s);return`<div class="todo-column"><div class="todo-column-head"><span>${esc(s)}</span><span class="count">${rows.length}</span></div>${rows.length?rows.map(({t,i})=>`<div class="todo-card ${todoStatusClass(t.status)}" style="${esc(todoCardStyle(t))}"><div class="todo-card-title">${esc(t.title)}</div><div class="todo-card-meta"><span class="color-dot" style="background:${esc(personColor(t.owner))}"></span>${esc(peopleText(t))} · ${esc(t.priority||KR.normal)} · ${esc(t.due||"")}</div><div class="todo-card-meta">${esc(t.project||KR.general)} · ${esc(t.type||KR.general)}</div><div class="todo-card-meta">${esc(t.detail||"")}</div><div class="row-actions" style="margin-top:10px"><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn icon danger" data-delete-todo="${i}">×</button></div></div>`).join(""):`<div class="meta">비어 있음</div>`}<button class="btn" data-add-todo-status="${esc(s)}">+ 빠른 추가</button></div>`}).join("")}</div>`;panel.classList.remove("hidden");panel.innerHTML=`<div class="todo-toolbar"><div class="todo-view"><button class="${todoViewMode==="board"?"active":""}" data-todo-view="board">보드</button><button class="${todoViewMode==="list"?"active":""}" data-todo-view="list">목록</button></div><button class="btn primary" id="todoAddBtn">할일 추가</button></div><div class="todo-filters"><input class="search" id="todoSearch" placeholder="제목, 설명, 담당자, 우선순위 검색" value="${esc(q)}">${chips}</div>${todoViewMode==="list"?todoListHtml(filtered):board}`;$("#todoSearch")?.addEventListener("input",renderTodoBoard)}
    renderAssignmentPeopleChips=function(){ensureConfigLists();const people=[KR.all,...state.people.map(p=>p.name)],counts=Object.fromEntries(people.map(p=>[p,p===KR.all?state.assignments.length:state.assignments.filter(a=>taskPeople(a).includes(p)).length]));$("#assignmentPeopleChips").innerHTML=people.map(p=>`<button class="person-chip ${assignmentPersonFilter===p?"active":""}" data-assignment-person="${esc(p)}">${p===KR.all?"":`<span class="color-dot" style="background:${esc(personColor(p))}"></span>`}${esc(p)} <strong>${counts[p]||0}</strong></button>`).join("")}
    assignmentTaskHtml=function(t){const i=state.assignments.indexOf(t),c=personColor(t.owner);return `<div class="calendar-task" style="border-left-color:${esc(c)};background:${esc(hexToRgba(c,.22))}" data-open-assignment="${i}" title="${esc(t.detail||t.title)}"><span class="color-dot" style="background:${esc(c)}"></span>${esc(peopleText(t))} · ${esc(t.title)}<br>${esc(t.status)} · ${esc(t.priority)}</div>`}
    renderAssignmentCalendar=function(){ensureConfigLists();renderAssignmentPeopleChips();renderScheduleViewButtons();const y=Number(els.assignmentCalendarYear.value),m=Number(els.assignmentCalendarMonth.value)-1,first=new Date(y,m,1),start=new Date(first);start.setDate(1-first.getDay());const names=["일","월","화","수","목","금","토"],days=assignmentCalendarView==="month"?42:assignmentCalendarView==="week"?7:1;let html=(assignmentCalendarView==="day"?["일정"]:names).map(n=>`<div class="day-name">${n}</div>`).join("");for(let i=0;i<days;i++){const d=assignmentCalendarView==="day"?new Date(y,m,1):new Date(start);if(assignmentCalendarView!=="day")d.setDate(start.getDate()+i);const iso=localDateString(d),tasks=state.assignments.filter(a=>(assignmentPersonFilter===KR.all||taskPeople(a).includes(assignmentPersonFilter))&&(a.start===iso||a.due===iso));html+=`<div class="day-cell ${d.getMonth()!==m?"muted":""}"><div class="day-number">${d.getDate()}</div>${tasks.map(assignmentTaskHtml).join("")}</div>`}els.assignmentCalendarGrid.style.gridTemplateColumns=assignmentCalendarView==="day"?"1fr":"repeat(7,minmax(0,1fr))";els.assignmentCalendarGrid.innerHTML=html}
    renderAdmin=function(){ensureConfigLists();$("#adminBrand").value=state.brand;$("#adminTitle").value=state.title;$("#adminSubtitle").value=state.subtitle;$("#adminPin").value=state.adminPin;if($("#adminGeminiKey"))$("#adminGeminiKey").value=state.geminiKey||"";if($("#adminSheetsUrl"))$("#adminSheetsUrl").value=state.sheetsUrl||"";if($("#adminSheetsSecret"))$("#adminSheetsSecret").value=state.sheetsSecret||"";["#adminBrand","#adminTitle","#adminSubtitle","#adminPin","#adminGeminiKey","#adminSheetsUrl","#adminSheetsSecret"].forEach(id=>$(id)&&($(id).readOnly=!adminBasicEditMode));$("#saveAdminBasicBtn").disabled=!adminBasicEditMode;$("#editAdminBasicBtn").textContent=adminBasicEditMode?"수정 중":"수정 시작";const nav=`<div class="card"><div class="panel-title"><h2>메뉴 카테고리</h2><button class="btn" id="adminAddNavBtn">카테고리 추가</button></div><div class="admin-list">${state.nav.map((n,i)=>`<div class="admin-item"><input class="field" data-admin-nav-icon="${i}" value="${esc(n.icon)}"><input class="field" data-admin-nav-label="${i}" value="${esc(n.label)}"><button class="btn icon" data-move-admin-nav="${i}" data-dir="-1" ${i===0?"disabled":""}>&uarr;</button><button class="btn icon" data-move-admin-nav="${i}" data-dir="1" ${i===state.nav.length-1?"disabled":""}>&darr;</button><button class="btn icon danger" data-delete-admin-nav="${i}">&times;</button></div>`).join("")}</div></div>`;const people=`<div class="card"><div class="panel-title"><h2>담당자 / 직원</h2><button class="btn" data-add-admin-person>직원 추가</button></div><div class="admin-list">${state.people.map((p,i)=>`<div class="admin-item"><input class="person-color" type="color" data-admin-person-color="${i}" value="${esc(p.color||personColor(p.name))}"><input class="field" data-admin-person-name="${i}" value="${esc(p.name)}" placeholder="이름"><input class="field" data-admin-person-role="${i}" value="${esc(p.role||"")}" placeholder="직책"><button class="btn icon" data-move-admin-person="${i}" data-dir="-1" ${i===0?"disabled":""}>&uarr;</button><button class="btn icon" data-move-admin-person="${i}" data-dir="1" ${i===state.people.length-1?"disabled":""}>&darr;</button><button class="btn icon danger" data-delete-admin-person="${i}">&times;</button></div>`).join("")}</div></div>`;const projects=`<div class="card"><div class="panel-title"><h2>현장/프로젝트</h2><button class="btn" data-add-admin-project>프로젝트 추가</button></div><div class="admin-list">${state.projects.map((p,i)=>`<div class="admin-item single"><input class="field" data-admin-project-name="${i}" value="${esc(p.name)}" placeholder="현장/프로젝트명"><button class="btn icon" data-move-admin-project="${i}" data-dir="-1" ${i===0?"disabled":""}>&uarr;</button><button class="btn icon" data-move-admin-project="${i}" data-dir="1" ${i===state.projects.length-1?"disabled":""}>&darr;</button><button class="btn icon danger" data-delete-admin-project="${i}">&times;</button></div>`).join("")}</div></div>`;$("#adminView .admin-grid").innerHTML=nav+people+projects+adminCard("현장/프로젝트 상태","admin-status","새 상태","상태 추가")+adminCard("현장 업무단계","admin-phase","새 단계","단계 추가")+adminCard("일정/업무 상태","admin-assignment-status","새 상태","상태 추가")+adminCard("할일 상태","admin-todo-status","새 상태","상태 추가")+adminCard("우선순위","admin-priority","새 우선순위","우선순위 추가")+adminCard("구분","admin-assignment-type","새 구분","구분 추가")+adminCard("시공일정 단계","admin-construction-phase","새 단계","단계 추가")+adminCard("시공사","admin-team","새 시공사","시공사 추가")+adminCard("구조물팀","admin-structure-team","새 팀","팀 추가")+`<div class="card" id="clockBgCard" style="grid-column:1/-1"><div class="panel-title"><h2>📷 대시보드 시계 배경사진</h2></div><p class="meta" style="margin:0 0 12px">대시보드 상단 시계 카드에 표시될 배경 이미지를 설정합니다. 저장된 사진은 브라우저에 유지됩니다.</p><div id="clockBgPreview" style="width:100%;height:160px;border-radius:12px;border:1px solid #a7f3d0;background:#ecfdf5;background-size:cover;background-position:center;display:grid;place-items:center;margin-bottom:14px;overflow:hidden"><span id="clockBgEmpty" style="color:#0d9488;font-size:13px;font-weight:700">사진이 없습니다</span></div><div style="display:flex;gap:10px;flex-wrap:wrap"><label class="btn primary" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px">📷 사진 선택<input type="file" accept="image/*" id="adminClockBgInput" style="display:none"></label><button class="btn danger" id="adminClockBgClear">🗑 사진 제거</button></div></div>`;(function initClockBgAdmin(){const preview=document.getElementById("clockBgPreview"),empty=document.getElementById("clockBgEmpty"),saved=localStorage.getItem("clockBgImage");if(saved&&preview){preview.style.backgroundImage=`url(${saved})`;if(empty)empty.style.display="none";}})();
// ★ Sheets 카드는 innerHTML 설정 완료 이후에 추가 (덮어쓰기 방지)
const _sheetsGrid=$("#adminView .admin-grid");
if(_sheetsGrid&&!_sheetsGrid.querySelector("#sheetsSyncCard")){
  const _sc=document.createElement("div");
  _sc.id="sheetsSyncCard";_sc.className="card";_sc.style.cssText="grid-column:1/-1;border-color:#a7f3d0;background:#f0fdf8";
  _sc.innerHTML=`<div class="panel-title"><h2>📊 Google Sheets 자동 동기화</h2><div class="row-actions"><button class="btn primary" id="sheetsSyncNowBtn" type="button">지금 동기화</button><button class="btn" id="sheetsScriptBtn" type="button">Apps Script 코드 보기</button></div></div><p class="meta" style="margin:0 0 10px">데이터 저장 시 자동으로 Google Sheets에 반영됩니다<br><span style='font-size:11px'>📋할일·📌업무지시·🏗시공일정·📁현장·📝회의록·🚗외근·🔍구조물검수</span></p><div style="background:#fff;border:1px solid #a7f3d0;border-radius:8px;padding:10px 12px;font-size:12px;color:#065f46;line-height:1.75"><strong>설정 순서:</strong> ① 위 <strong>수정 시작</strong> → Sheets URL·동기화 키 입력 → 저장<br>② <strong>Apps Script 코드 보기</strong> → 코드 복사 → <a href="https://script.google.com" target="_blank" style="color:#0d9488">script.google.com</a> 붙여넣기 → 배포 → URL 입력</div>`;
  _sheetsGrid.appendChild(_sc);
}
/* ── 데이터 백업/복원 카드 ── */
const _backupGrid=$("#adminView .admin-grid");
if(_backupGrid&&!_backupGrid.querySelector("#dataBackupCard")){
  const _bc=document.createElement("div");
  _bc.id="dataBackupCard";_bc.className="card";_bc.style.cssText="grid-column:1/-1;border-color:#bee3f8;background:#f0f8ff";
  _bc.innerHTML=`<div class="panel-title"><h2>💾 데이터 백업 / 복원</h2><div class="row-actions"><button class="btn primary" id="exportJsonBtn" type="button">📥 백업 파일 저장</button><label class="btn" style="cursor:pointer">📤 백업 파일 복원<input type="file" id="importJsonInput" accept=".json" style="display:none"></label></div></div><p class="meta" style="margin:0 0 6px">전체 데이터(할일·업무·회의록·시공일정 등)를 JSON 파일로 저장하거나 복원합니다.<br><strong>큰 패치 작업 전에 반드시 "백업 파일 저장"을 눌러두세요.</strong></p><div style="background:#fff;border:1px solid #bee3f8;border-radius:8px;padding:10px 12px;font-size:12px;color:#1e40af;line-height:1.75"><strong>자동 백업:</strong> 데이터 변경 시 Supabase에 자동 저장 + 5분마다 주기 저장<br><strong>수동 백업:</strong> "백업 파일 저장" → 내 컴퓨터에 JSON 파일 보관<br><strong>복원:</strong> "백업 파일 복원" → 저장해둔 JSON 파일 선택 → 자동 복구</div>`;
  _backupGrid.appendChild(_bc);
}
document.addEventListener("click",e=>{
  const t=e.target.closest("button")||e.target;
  if(t.id==="exportJsonBtn"){e.preventDefault();e.stopImmediatePropagation();exportStateJson()}
},true);
document.addEventListener("change",e=>{
  if(e.target.id==="importJsonInput"&&e.target.files[0]){importStateJson(e.target.files[0]);e.target.value=""}
},true);
}
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.hasAttribute?.("data-add-admin-person")){e.preventDefault();e.stopImmediatePropagation();state.people.push({name:KR.newEmployee,role:KR.employee,area:"",monthlyTarget:30,yearlyTarget:360,color:pastelPalette[state.people.length%pastelPalette.length]});saveState("직원을 추가했습니다.");render()}if(t.hasAttribute?.("data-add-admin-project")){e.preventDefault();e.stopImmediatePropagation();state.projects.push({name:KR.newProject});saveState("프로젝트를 추가했습니다.");render()}},true)
    document.addEventListener("input",e=>{const t=e.target;if(t.dataset.adminPersonPin){const p=state.people[Number(t.dataset.adminPersonPin)];if(p){p.pin=t.value.trim();persistState()}}},true)
    let dashboardSelectedConstruction=0,dashboardDate=today;
    function linkedByProjectName(name){
      const n=String(name||"").trim();
      return {
        todos:state.todos.map((t,i)=>({t:normalizeTodo(t),i})).filter(({t})=>t.project===n||t.title?.includes(n)||t.detail?.includes(n)),
        assignments:state.assignments.map((a,i)=>({a:normalizeAssignment(a),i})).filter(({a})=>a.project===n||a.title?.includes(n)||a.detail?.includes(n))
      }
    }
    function dashboardConstructionRows(){
      const q=($("#dashboardProjectSearch")?.value||"").toLowerCase();
      return state.construction.map((c,i)=>({c,i})).filter(({c})=>[c.site,c.company,c.customer,c.phase,c.status,c.owner].join(" ").toLowerCase().includes(q));
    }
    function dashboardDateItems(date){
      const todos=state.todos.map((t,i)=>({t:normalizeTodo(t),i})).filter(({t})=>t.start===date||t.due===date);
      const assignments=state.assignments.map((a,i)=>({a:normalizeAssignment(a),i})).filter(({a})=>a.start===date||a.due===date);
      return {todos,assignments};
    }
    function renderDashboardMiniCalendar(){
      const y=Number(els.calendarYear.value)||Number(today.slice(0,4)),m=(Number(els.calendarMonth.value)||Number(today.slice(5,7)))-1,first=new Date(y,m,1),start=new Date(first);
      start.setDate(1-first.getDay());
      const names=["일","월","화","수","목","금","토"];
      let html=names.map(n=>`<div class="mini-day-name">${n}</div>`).join("");
      for(let i=0;i<42;i++){
        const d=new Date(start);d.setDate(start.getDate()+i);
        const iso=localDateString(d),items=dashboardDateItems(iso),has=items.todos.length+items.assignments.length>0;
        html+=`<button class="mini-day ${d.getMonth()!==m?"muted":""} ${iso===dashboardDate?"active":""} ${has?"has-work":""}" data-dashboard-date="${iso}" title="${iso}">${d.getDate()}</button>`;
      }
      return html;
    }
    function renderDashboard(){
      ensureConfigLists();ensureTaskLinks();
      els.dashboardView.classList.remove("hidden");
      els.dashboardView.classList.add("dashboard-workspace");
      const rows=dashboardConstructionRows();
      if(!rows.some(x=>x.i===dashboardSelectedConstruction))dashboardSelectedConstruction=rows.length?rows[0].i:-1;
      const selected=state.construction[dashboardSelectedConstruction];
      const linked=selected?linkedByProjectName(selected.site):{todos:[],assignments:[]};
      const dateItems=dashboardDateItems(dashboardDate);
      const progressTotal=state.construction.length;
      const progressDone=state.construction.filter(c=>c.status==="완료"||c.phase==="완료").length;
      const activeCount=state.construction.filter(c=>c.status==="시공중"||c.phase==="구조물시공"||c.phase==="전기시공").length;
      const lateCount=state.construction.filter(c=>c.status==="지연").length;
      els.dashboardView.innerHTML=`
        <div class="workspace-dashboard">
          <aside class="dash-column">
            <section class="dash-section">
              <div class="dash-title"><h2>시공일정</h2><button class="btn primary" data-dashboard-add-construction>추가</button></div>
              <input class="project-search" id="dashboardProjectSearch" placeholder="현장, 시공사, 담당 검색" value="${esc($("#dashboardProjectSearch")?.value||"")}">
              <div class="dash-link-row">
                <span class="dash-pill">전체 ${progressTotal}</span>
                <span class="dash-pill">시공중 ${activeCount}</span>
                <span class="dash-pill">지연 ${lateCount}</span>
              </div>
              <div class="project-list">
                ${rows.length?rows.map(({c,i})=>`<button class="project-item ${i===dashboardSelectedConstruction?"active":""}" data-dashboard-construction="${i}">
                  <span class="project-name">${esc(c.site||"이름 없는 발전소")}</span>
                  <span class="project-meta">${esc(c.company||"-")} · ${esc(c.kw||0)}kW · ${esc(c.status||"예정")}</span>
                  <span class="project-meta">${esc(c.phase||"-")} · ${esc(c.start||"-")} ~ ${esc(c.end||"")}</span>
                </button>`).join(""):`<div class="dash-empty">등록된 시공일정이 없습니다.</div>`}
              </div>
            </section>
          </aside>
          <div class="dash-main">
            <section class="dash-section">
              <div class="dash-title"><h2>시공관리 현황</h2>${selected?`<button class="btn" data-edit-construction="${dashboardSelectedConstruction}">수정</button>`:""}</div>
              ${selected?`
                <div class="detail-grid">
                  <div class="detail-cell"><span class="label">현장</span><strong>${esc(selected.site)}</strong></div>
                  <div class="detail-cell"><span class="label">시공사</span><strong>${esc(selected.company)}</strong></div>
                  <div class="detail-cell"><span class="label">용량</span><strong>${esc(selected.kw||0)}kW</strong></div>
                  <div class="detail-cell"><span class="label">상태</span><strong><span class="badge ${statusClass(selected.status)}">${esc(selected.status||"예정")}</span></strong></div>
                  <div class="detail-cell"><span class="label">업무단계</span><strong>${esc(selected.phase||"-")}</strong></div>
                  <div class="detail-cell"><span class="label">기간</span><strong>${esc(selected.start||"-")} ~ ${esc(selected.end||"")}</strong></div>
                  <div class="detail-cell full"><span class="label">다음 액션</span><strong>${esc(selected.next||"등록된 다음 액션이 없습니다.")}</strong></div>
                </div>
              `:`<div class="dash-empty">왼쪽에서 시공일정을 선택하거나 새로 추가하세요.</div>`}
            </section>
            <section class="dash-section compact">
              <div class="dash-title"><h2>메모</h2>${selected?`<button class="btn" data-dashboard-add-memo="${dashboardSelectedConstruction}">메모 추가</button>`:""}</div>
              <div class="memo-list">${selected&&Array.isArray(selected.memos)&&selected.memos.length?selected.memos.map((m,mi)=>`<div class="memo-item"><div>${esc(m.text||m)}</div><div class="meta">${esc(m.date||"")}</div><button class="btn icon danger" data-dashboard-delete-memo="${dashboardSelectedConstruction}" data-memo-index="${mi}">×</button></div>`).join(""):`<div class="meta">등록된 메모가 없습니다.</div>`}</div>
            </section>
            <section class="dash-section compact">
              <div class="dash-title"><h2>할일</h2>${selected?`<button class="btn primary" data-dashboard-add-todo="${dashboardSelectedConstruction}">할일 추가</button>`:""}</div>
              <div class="linked-list">${linked.todos.length?linked.todos.map(({t,i})=>`<button class="linked-item" data-edit-todo="${i}"><strong>${esc(t.title)}</strong><div class="meta">${esc(peopleText(t))} · ${esc(t.status)} · ${esc(t.due)}</div></button>`).join(""):`<div class="meta">이 현장과 연결된 할일이 없습니다.</div>`}</div>
            </section>
            <section class="dash-section compact">
              <div class="dash-title"><h2>일정</h2>${selected?`<button class="btn primary" data-dashboard-add-assignment="${dashboardSelectedConstruction}">일정 등록</button>`:""}</div>
              <div class="linked-list">${linked.assignments.length?linked.assignments.map(({a,i})=>`<button class="linked-item" data-open-assignment="${i}"><strong>${esc(a.title)}</strong><div class="meta">${esc(peopleText(a))} · ${esc(a.start)} ~ ${esc(a.due)} · ${esc(a.status)}</div></button>`).join(""):`<div class="meta">이 현장과 연결된 일정이 없습니다.</div>`}</div>
            </section>
          </div>
          <aside class="dash-side">
            <section class="dash-section">
              <div class="mini-calendar-head">
                <button class="btn icon" data-dashboard-month="-1">‹</button>
                <strong>${esc(els.calendarYear.value||today.slice(0,4))}년 ${esc(els.calendarMonth.value||today.slice(5,7))}월</strong>
                <button class="btn icon" data-dashboard-month="1">›</button>
              </div>
              <div class="mini-calendar">${renderDashboardMiniCalendar()}</div>
            </section>
            <section class="dash-section">
              <div class="dash-title"><h2>${esc(dashboardDate)} 할일</h2><button class="btn" data-dashboard-today>오늘</button></div>
              <div class="today-list">
                ${dateItems.todos.map(({t,i})=>`<button class="today-item" data-edit-todo="${i}"><strong>${esc(t.title)}</strong><div class="meta">${esc(peopleText(t))} · ${esc(t.status)} · 할일</div></button>`).join("")}
                ${dateItems.assignments.map(({a,i})=>`<button class="today-item" data-open-assignment="${i}"><strong>${esc(a.title)}</strong><div class="meta">${esc(peopleText(a))} · ${esc(a.status)} · 일정</div></button>`).join("")}
                ${dateItems.todos.length+dateItems.assignments.length===0?`<div class="meta">선택한 날짜에 등록된 항목이 없습니다.</div>`:""}
              </div>
            </section>
          </aside>
        </div>`;
      $("#dashboardProjectSearch")?.addEventListener("input",renderDashboard);
    }
    renderCalendar=renderDashboard;
    const priorRenderView=renderView;
    renderView=function(){
      priorRenderView();
      $("#kpis").classList.toggle("hidden",currentView==="dashboard"||currentView==="assignments"||currentView==="todos");
      els.dashboardView.classList.toggle("hidden",currentView!=="dashboard");
    }
    document.addEventListener("click",e=>{
      const t=e.target.closest("button,[data-dashboard-date]")||e.target;
      if(t.dataset.dashboardConstruction){dashboardSelectedConstruction=Number(t.dataset.dashboardConstruction);renderDashboard()}
      if(t.dataset.dashboardDate){dashboardDate=t.dataset.dashboardDate;renderDashboard()}
      if(t.dataset.dashboardMonth){const d=new Date(Number(els.calendarYear.value),Number(els.calendarMonth.value)-1+Number(t.dataset.dashboardMonth),1);setCalendarMonth(els.calendarYear,els.calendarMonth,localDateString(d));renderDashboard()}
      if(t.dataset.dashboardToday!==undefined){resetDashboardToToday();renderDashboard()}
      if(t.dataset.dashboardAddConstruction!==undefined)openConstructionModal();
      if(t.dataset.dashboardAddMemo){const i=Number(t.dataset.dashboardAddMemo),text=prompt("메모 내용을 입력하세요.");if(text){state.construction[i].memos=state.construction[i].memos||[];state.construction[i].memos.unshift({text,date:today});saveState("메모를 저장했습니다.");renderDashboard()}}
      if(t.dataset.dashboardDeleteMemo){const i=Number(t.dataset.dashboardDeleteMemo),mi=Number(t.dataset.memoIndex);state.construction[i].memos?.splice(mi,1);saveState("메모를 삭제했습니다.");renderDashboard()}
      if(t.dataset.dashboardAddTodo){const c=state.construction[Number(t.dataset.dashboardAddTodo)];openTodoModal();$("#todoProject").value=c?.site||KR.general;$("#todoTitle").value=(c?.site||"현장")+" 할일";$("#todoDetail").value=c?.next||""}
      if(t.dataset.dashboardAddAssignment){const c=state.construction[Number(t.dataset.dashboardAddAssignment)];openAssignmentModal();$("#assignmentProject").value=c?.site||KR.general;$("#assignmentTitle").value=(c?.site||"현장")+" 일정";$("#assignmentDetail").value=c?.next||""}
    },true);
    let todoListFilters={title:"",owner:"",status:"",priority:"",due:""},todoListSort={key:"due",dir:"desc"},todoSearchComposing=false,todoListFilterComposing=null;
    function bindTodoSearchInput(){
      const input=$("#todoSearch");if(!input)return;
      input.addEventListener("compositionstart",()=>{todoSearchComposing=true});
      input.addEventListener("compositionend",()=>{todoSearchComposing=false;renderTodoBoard()});
      input.addEventListener("input",()=>{if(!todoSearchComposing)renderTodoBoard()});
    }
    function todoField(t,key){return key==="title"?t.title:key==="owner"?peopleText(t):key==="status"?t.status:key==="priority"?t.priority:key==="due"?t.due:""}
    function todoSortButton(key,label){const on=todoListSort.key===key,mark=on?`<span class="sort-mark">${todoListSort.dir==="asc"?"▲":"▼"}</span>`:"";return `<button class="todo-sort" data-todo-sort="${key}">${esc(label)}${mark}</button>`}
    function todoListFilterInput(key,label){return `<input class="todo-list-filter" data-todo-list-filter="${key}" value="${esc(todoListFilters[key]||"")}" placeholder="${esc(label)}">`}
    function todoFilteredRows(baseRows){
      const rows=baseRows.filter(({t})=>Object.entries(todoListFilters).every(([k,v])=>!v||String(todoField(t,k)||"").toLowerCase().includes(v.toLowerCase())));
      const dir=todoListSort.dir==="asc"?1:-1,key=todoListSort.key;
      return rows.sort((a,b)=>String(todoField(a.t,key)||"").localeCompare(String(todoField(b.t,key)||"","ko"),"ko",{numeric:true})*dir);
    }
    function todoDueBadge(t){
      if(!t?.due||t.status===KR.done||t.status===KR.cancel)return "";
      const due=localDateValue(t.due),now=localDateValue(today),days=Math.ceil((due-now)/(1000*60*60*24));
      if(days<0)return `<span class="due-badge late" title="마감일: ${esc(t.due)}">마감일 지남</span>`;
      if(days<=3)return `<span class="due-badge soon" title="마감일: ${esc(t.due)}">마감일 임박</span>`;
      return "";
    }
    function todoShareBadge(t){
      const share=t.kakaoSharedAt?`<span class="share-badge shared" title="카톡 공유: ${esc(t.kakaoSharedAt)}">카톡 공유됨</span>`:`<span class="share-badge unshared">카톡 미공유</span>`;
      return share+todoDueBadge(t);
    }
    function todoProgressCompare(a,b){
      const au=a.t.updatedAt?new Date(a.t.updatedAt).getTime():0,bu=b.t.updatedAt?new Date(b.t.updatedAt).getTime():0;
      if(au!==bu)return bu-au;
      const ap=todoProgress(a.t).pct,bp=todoProgress(b.t).pct;
      return bp-ap||String(a.t.due||"").localeCompare(String(b.t.due||""),"ko",{numeric:true})||String(a.t.title||"").localeCompare(String(b.t.title||""),"ko");
    }
    function markTodoKakaoShared(i,shared=true,rerender=true){
      const todo=state.todos[i];if(!todo)return;
      if(shared){todo.kakaoSharedAt=new Date().toLocaleString("ko-KR");todo.kakaoSharedBy="사용자"}
      else{delete todo.kakaoSharedAt;delete todo.kakaoSharedBy}
      syncTodoToAssignment(i);
      if(rerender)renderTodoBoard();
      saveStateAfterPaint(shared?"카톡 공유됨으로 표시했습니다.":"카톡 미공유로 되돌렸습니다.");
    }
    todoListHtml=function(rows){
      rows=todoFilteredRows(rows);
      return `<div class="todo-list"><div class="todo-list-row head"><span>${todoSortButton("title","제목")}</span><span>${todoSortButton("owner","담당")}</span><span>${todoSortButton("status","상태")}</span><span>${todoSortButton("priority","우선")}</span><span>${todoSortButton("due","마감")}</span><span>관리</span></div><div class="todo-list-row filter"><span>${todoListFilterInput("title","제목")}</span><span>${todoListFilterInput("owner","담당")}</span><span>${todoListFilterInput("status","상태")}</span><span>${todoListFilterInput("priority","우선")}</span><span>${todoListFilterInput("due","마감")}</span><span></span></div>${rows.length?rows.map(({t,i})=>`<div class="todo-list-row" style="border-left:5px solid ${esc(personColor(t.owner))}"><strong>${esc(t.title)} ${todoShareBadge(t)}</strong><span>${esc(peopleText(t))}</span><span><span class="badge ${statusClass(t.status)}">${esc(t.status)}</span></span><span>${esc(t.priority||KR.normal)}</span><span>${esc(t.due||"")}</span><span><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn" data-toggle-todo-share="${i}">${t.kakaoSharedAt?"미공유로":"공유처리"}</button><button class="btn icon danger" data-delete-todo="${i}">×</button></span></div>`).join(""):`<div class="todo-list-row"><span class="meta">조건에 맞는 할일이 없습니다.</span></div>`}</div>`
    }
    renderTodoBoard=function(){
      ensureConfigLists();ensureTaskLinks();
      const panel=$("#todoBoardPanel"),statuses=state.todoStatuses,q=$("#todoSearch")?.value||"",owners=[KR.all,...state.people.map(p=>p.name)];
      const filtered=state.todos.map((t,i)=>({t:normalizeTodo(t),i})).filter(({t})=>(todoStatusFilter===KR.all||t.status===todoStatusFilter)&&(todoOwnerFilter===KR.all||taskPeople(t).includes(todoOwnerFilter))&&todoMatches(t,q));
      const chips=`<div class="todo-chips"><button class="todo-chip ${todoStatusFilter===KR.all?"active":""}" data-todo-status-filter="${KR.all}">${KR.all} <strong>${state.todos.length}</strong></button>${statuses.map(s=>`<button class="todo-chip ${todoStatusFilter===s?"active":""}" data-todo-status-filter="${esc(s)}">${esc(s)} <strong>${state.todos.filter(t=>normalizeTodo(t).status===s).length}</strong></button>`).join("")}</div><div class="todo-chips">${owners.map(o=>`<button class="todo-chip ${todoOwnerFilter===o?"active":""}" data-todo-owner-filter="${esc(o)}">${o===KR.all?"":`<span class="color-dot" style="background:${esc(personColor(o))}"></span>`}${esc(o)} <strong>${o===KR.all?state.todos.length:state.todos.filter(t=>taskPeople(t).includes(o)).length}</strong></button>`).join("")}</div>`;
      const board=`<div class="todo-board">${statuses.map(s=>{const rows=filtered.filter(x=>x.t.status===s).sort(todoProgressCompare);const visible=s===KR.done?rows.slice(0,5):rows;const hidden=rows.length-visible.length;return`<div class="todo-column" data-todo-drop-status="${esc(s)}"><div class="todo-column-head"><span>${esc(s)}</span><span class="count">${rows.length}</span></div>${visible.length?visible.map(({t,i})=>`<div class="todo-card ${todoStatusClass(t.status)}" draggable="true" data-todo-drag-index="${i}" style="${esc(todoCardStyle(t))}"><div class="todo-card-title">${esc(t.title)} ${todoShareBadge(t)}</div><div class="todo-card-meta"><span class="color-dot" style="background:${esc(personColor(t.owner))}"></span>${esc(peopleText(t))} · ${esc(t.priority||KR.normal)} · ${esc(t.due||"")}</div><div class="todo-card-meta">${esc(t.project||KR.general)} · ${esc(t.type||KR.general)}</div><div class="todo-card-meta">${esc(t.detail||"")}</div><div class="row-actions"><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn" data-toggle-todo-share="${i}">${t.kakaoSharedAt?"미공유로":"공유처리"}</button><button class="btn icon danger" data-delete-todo="${i}">×</button></div></div>`).join(""):`<div class="meta">비어 있음</div>`}${hidden>0?`<button class="btn todo-complete-more" data-show-completed-list>완료 ${hidden}건 더보기</button>`:""}${s!==KR.done?`<button class="btn" data-add-todo-status="${esc(s)}">+ 빠른 추가</button>`:""}</div>`}).join("")}</div>`;
      panel.classList.remove("hidden");
      if(todoPanelTab==="diary"){renderDiaryView(panel);return;}
      panel.innerHTML=`<div class="todo-toolbar"><div class="todo-view"><button class="${todoViewMode==="board"?"active":""}" data-todo-view="board">보드</button><button class="${todoViewMode==="list"?"active":""}" data-todo-view="list">목록</button><button class="" data-todo-main-tab="diary">업무일지</button></div><button class="btn primary" id="todoAddBtn">할일 추가</button></div><div class="todo-filters"><input class="search" id="todoSearch" placeholder="제목, 설명, 담당자, 우선순위 검색" value="${esc(q)}">${chips}</div>${todoViewMode==="list"?todoListHtml(filtered):board}`;
      bindTodoSearchInput();
    }
    function renderDiaryView(panel){
      if(!state.workDiary)state.workDiary=[];
      const date=diaryDateCursor||today;
      const autoEntries=state.todos.filter(t=>t.updatedAt&&t.updatedAt.startsWith(date));
      const entry=state.workDiary.find(e=>e.date===date)||{date,manual:""};
      const allDates=[...new Set([...state.workDiary.filter(e=>e.manual).map(e=>e.date),...state.todos.filter(t=>t.updatedAt).map(t=>t.updatedAt.slice(0,10))])].sort().reverse().slice(0,30);
      panel.innerHTML=`<div class="todo-toolbar"><div class="todo-view"><button data-todo-view="board">보드</button><button data-todo-view="list">목록</button><button class="active" data-todo-main-tab="diary">업무일지</button></div><button class="btn primary" id="todoAddBtn">할일 추가</button></div><div class="diary-wrap"><div class="diary-nav"><button class="btn icon" data-diary-nav="-1">&#9664;</button><span class="diary-date-label">${esc(date)}</span><button class="btn icon" data-diary-nav="1">&#9654;</button><button class="btn" data-diary-today="">오늘</button><input type="date" id="diaryDateInput" class="diary-date-input" value="${esc(date)}"></div><div class="diary-section"><div class="diary-section-title">📋 자동 업무 내역 <span class="diary-meta">(할일에서 저장된 항목)</span></div>${autoEntries.length?autoEntries.map(t=>`<div class="diary-auto-item"><span class="badge ${statusClass(t.status)}">${esc(t.status)}</span> <strong>${esc(t.title)}</strong> <span class="diary-meta">${esc(peopleText(t))}${t.project?` · ${esc(t.project)}`:""}</span></div>`).join(""):(`<div class="meta" style="padding:8px 0">이 날 업데이트된 할일이 없습니다.</div>`)}<div style="margin-top:10px"><button class="btn" data-diary-gen="">📝 오늘 할일 기반 일지 자동생성</button></div></div><div class="diary-section"><div class="diary-section-title">✏️ 직접 입력 메모</div><textarea id="diaryManualInput" class="diary-textarea" placeholder="오늘 한 일, 특이사항, 내일 할 일 등을 자유롭게 기입하세요...">${esc(entry.manual||"")}</textarea><div style="margin-top:8px;display:flex;gap:8px"><button class="btn primary" data-diary-save="">저장</button><button class="btn" data-diary-copy="">복사</button></div></div>${allDates.length?`<div class="diary-section"><div class="diary-section-title">📅 과거 업무일지</div><div class="diary-history">${allDates.filter(d=>d!==date).slice(0,15).map(d=>{const e=state.workDiary.find(x=>x.date===d)||{manual:""};const ac=state.todos.filter(t=>t.updatedAt&&t.updatedAt.startsWith(d)).length;return`<div class="diary-history-item" data-diary-goto="${esc(d)}"><strong>${esc(d)}</strong><span class="diary-meta">${ac}건 활동${e.manual?` · 메모 있음`:""}</span></div>`}).join("")}</div></div>`:""}</div>`;
      document.getElementById("diaryDateInput")?.addEventListener("change",function(){diaryDateCursor=this.value;renderTodoBoard();});
    }
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.dataset.toggleTodoShare!==undefined){e.preventDefault();e.stopImmediatePropagation();const i=Number(t.dataset.toggleTodoShare);markTodoKakaoShared(i,!state.todos[i]?.kakaoSharedAt,true);return}if(t.dataset.deleteTodo!==undefined){e.preventDefault();e.stopImmediatePropagation();const i=Number(t.dataset.deleteTodo);const todo=state.todos[i];if(!todo)return;if(!confirm(`'${todo.title||"할일"}' 항목을 삭제할까요?`))return;const card=t.closest(".todo-card,.todo-list-row");if(card){card.style.transition="opacity .12s ease,transform .12s ease";card.style.opacity=".35";card.style.transform="scale(.98)";setTimeout(()=>card.remove(),130)}const _delTodoId=todo.id,_delAsgId=todo.linkedAssignmentId;deleteTodoAt(i);if(_delTodoId){fetch(`${SUPABASE_URL}/rest/v1/todos?id=in.("${_delTodoId}")`,{method:"DELETE",headers:supabaseHeaders()}).catch(()=>{});}if(_delAsgId){fetch(`${SUPABASE_URL}/rest/v1/assignments?id=in.("${_delAsgId}")`,{method:"DELETE",headers:supabaseHeaders()}).catch(()=>{});}setTimeout(()=>{renderTodoBoard();deleteAndSync("할일과 연결된 일정을 함께 삭제했습니다.")},20);return}if(t.dataset.showCompletedList!==undefined){todoStatusFilter=KR.done;todoViewMode="list";renderTodoBoard()}if(t.dataset.todoSort){todoListSort.dir=todoListSort.key===t.dataset.todoSort&&todoListSort.dir==="asc"?"desc":"asc";todoListSort.key=t.dataset.todoSort;renderTodoBoard()}},true);
    document.addEventListener("compositionstart",e=>{const t=e.target;if(t.dataset.todoListFilter)todoListFilterComposing=t.dataset.todoListFilter},true);
    document.addEventListener("compositionend",e=>{const t=e.target;if(t.dataset.todoListFilter){todoListFilterComposing=null;todoListFilters[t.dataset.todoListFilter]=t.value;renderTodoBoard();const next=document.querySelector(`[data-todo-list-filter="${t.dataset.todoListFilter}"]`);if(next){next.focus();next.setSelectionRange(t.value.length,t.value.length)}}},true);
    document.addEventListener("input",e=>{const t=e.target;if(t.dataset.todoListFilter){todoListFilters[t.dataset.todoListFilter]=t.value;if(todoListFilterComposing===t.dataset.todoListFilter)return;renderTodoBoard();const next=document.querySelector(`[data-todo-list-filter="${t.dataset.todoListFilter}"]`);if(next){next.focus();next.setSelectionRange(t.value.length,t.value.length)}}},true);
    let draggedTodoIndex=null;
    document.addEventListener("dragstart",e=>{
      const card=e.target.closest?.("[data-todo-drag-index]");
      if(!card)return;
      draggedTodoIndex=Number(card.dataset.todoDragIndex);
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed="move";
      e.dataTransfer.setData("text/plain",String(draggedTodoIndex));
    },true);
    document.addEventListener("dragend",e=>{
      e.target.closest?.("[data-todo-drag-index]")?.classList.remove("dragging");
      $$(".todo-column.drag-over").forEach(c=>c.classList.remove("drag-over"));
      draggedTodoIndex=null;
    },true);
    document.addEventListener("dragover",e=>{
      const col=e.target.closest?.("[data-todo-drop-status]");
      if(!col||draggedTodoIndex===null)return;
      e.preventDefault();
      e.dataTransfer.dropEffect="move";
      col.classList.add("drag-over");
    },true);
    document.addEventListener("dragleave",e=>{
      const col=e.target.closest?.("[data-todo-drop-status]");
      if(col&&!col.contains(e.relatedTarget))col.classList.remove("drag-over");
    },true);
    document.addEventListener("drop",e=>{
      const col=e.target.closest?.("[data-todo-drop-status]");
      if(!col)return;
      e.preventDefault();
      col.classList.remove("drag-over");
      const i=Number(e.dataTransfer.getData("text/plain")||draggedTodoIndex);
      const nextStatus=col.dataset.todoDropStatus;
      const todo=state.todos[i];
      if(!todo||!nextStatus||todo.status===nextStatus)return;
      todo.status=nextStatus;
      applyTodoStatusRules(todo);
      syncTodoToAssignment(i);
      renderTodoBoard();
      saveStateAfterPaint(`할일을 '${nextStatus}' 상태로 이동했습니다.`);
    },true);
    function monthValue(){return `${els.calendarYear.value||today.slice(0,4)}-${els.calendarMonth.value||today.slice(5,7)}`}
    function inSelectedConstructionMonth(c){const ym=monthValue();return [c.start,c.end].some(d=>d&&d.startsWith(ym))||(!c.end&&c.start&&c.start<=`${ym}-31`)}
    function constructionMonthRows(){return state.construction.map((c,i)=>({c,i})).filter(({c})=>inSelectedConstructionMonth(c))}
    function statusCount(rows,status){return rows.filter(({c})=>c.status===status||c.phase===status).length}
    function kwSum(rows){return Math.round(rows.reduce((s,{c})=>s+(Number(c.kw)||0),0)*100)/100}
    function avgDuration(rows){const done=rows.map(({c})=>durationDays(c.start,c.end)).filter(Boolean);return done.length?Math.round(done.reduce((a,b)=>a+b,0)/done.length):0}
    function smallBar(label,value,max,color="var(--teal)"){const pct=max?Math.round(value/max*100):0;return `<div class="chart-row"><span>${esc(label)}</span><div class="chart-track"><div class="chart-fill" style="width:${pct}%;background:${color}"></div></div><strong>${esc(value)}</strong></div>`}
    function renderDashboardKpi(rows){
      const total=rows.length,done=statusCount(rows,"완료"),active=rows.filter(({c})=>c.status==="시공중"||["구조물시공","전기시공"].includes(c.phase)).length,late=statusCount(rows,"지연"),kw=kwSum(rows);
      const teams=state.constructionTeams||["남해","다온","다호","동광","금태양","JW","보강"],maxTeam=Math.max(1,...teams.map(t=>rows.filter(({c})=>c.company===t).length));
      const phases=["자재입고완료","구조물시공","전기시공","완료"],maxPhase=Math.max(1,...phases.map(p=>rows.filter(({c})=>c.phase===p).length));
      return `<div class="dash-kpi-grid">
        <div class="dash-section compact"><div class="label">월간 시공 진행률</div><div class="donut" style="--p:${total?Math.round(done/total*100):0}%"><span>${total?Math.round(done/total*100):0}%</span></div><div class="meta">완료 ${done} / 전체 ${total}</div></div>
        <div class="dash-section compact"><div class="label">상태별 발전소</div>${smallBar("시공중",active,total)}${smallBar("예정",statusCount(rows,"예정"),total,"#7aa7d9")}${smallBar("지연",late,total,"#d87568")}</div>
        <div class="dash-section compact"><div class="label">업무단계 분포</div>${phases.map(p=>smallBar(p,rows.filter(({c})=>c.phase===p).length,maxPhase)).join("")}</div>
        <div class="dash-section compact"><div class="label">월간 시공 물량</div><div class="value">${esc(kw)}kW</div><div class="meta">평균 소요일 ${avgDuration(rows)}일</div>${teams.map(t=>smallBar(t,rows.filter(({c})=>c.company===t).length,maxTeam)).join("")}</div>
      </div>`
    }
    function renderWeatherBox(){
      return `<section class="dash-section compact"><div class="dash-title"><h2>날씨 · 현재 시간</h2><button class="btn" data-refresh-weather>새로고침</button></div><div id="dashClock" class="value" style="font-size:22px"></div><div id="dashWeatherContent" class="meta">날씨 정보를 불러오는 중입니다.</div></section>`
    }
    function updateClock(){const now=new Date();const dateEl=$("#dashClockDate");const timeEl=$("#dashClock");if(dateEl)dateEl.textContent=now.toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"short"});if(timeEl)timeEl.textContent=now.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}
    async function updateWeather(){
      const box=$("#dashWeatherContent");if(!box)return;
      const render=(temp,wind,label="현재 위치")=>{box.innerHTML=`${esc(label)} 기준 · 기온 <strong>${Math.round(temp)}°C</strong> · 풍속 <strong>${Math.round(wind)}m/s</strong><div class="meta">현장 주소가 없어서 브라우저 현재 위치 또는 서울 기준으로 표시합니다.</div>`};
      try{
        const pos=await new Promise((resolve,reject)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:2500}):reject());
        const {latitude,longitude}=pos.coords;
        const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&timezone=Asia%2FSeoul`);
        const j=await r.json();render(j.current.temperature_2m,j.current.wind_speed_10m);
      }catch{
        try{const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,wind_speed_10m&timezone=Asia%2FSeoul");const j=await r.json();render(j.current.temperature_2m,j.current.wind_speed_10m,"서울");}
        catch{box.textContent="날씨 정보를 불러오지 못했습니다. 네트워크 또는 위치 권한을 확인하세요."}
      }
    }
    renderDashboard=function(){
      ensureConfigLists();ensureTaskLinks();
      const rows=constructionMonthRows(),q=($("#dashboardProjectSearch")?.value||"").toLowerCase(),shown=rows.filter(({c})=>[c.site,c.company,c.customer,c.phase,c.status,c.owner].join(" ").toLowerCase().includes(q));
      const dateItems=dashboardDateItems(dashboardDate),ym=monthValue();
      els.dashboardView.innerHTML=`<div class="workspace-dashboard">
        <aside class="dash-column"><section class="dash-section"><div class="dash-title"><h2>시공일정</h2><button class="btn primary" data-dashboard-add-construction>추가</button></div><input class="project-search" id="dashboardProjectSearch" placeholder="현장, 시공사, 담당 검색" value="${esc($("#dashboardProjectSearch")?.value||"")}"><div class="dash-link-row"><span class="dash-pill">${ym}</span><span class="dash-pill">월 공사 ${rows.length}</span><span class="dash-pill">지연 ${statusCount(rows,"지연")}</span></div><div class="project-list">${shown.length?shown.map(({c,i})=>`<button class="project-item" data-dashboard-construction="${i}"><span class="project-name">${esc(c.site||"이름 없는 발전소")}</span><span class="project-meta">${esc(c.company||"-")} · ${esc(c.kw||0)}kW · ${esc(c.status||"예정")}</span><span class="project-meta">${esc(c.phase||"-")} · ${esc(c.start||"-")} ~ ${esc(c.end||"")}</span></button>`).join(""):`<div class="dash-empty">${ym} 공사가 없습니다.</div>`}</div></section></aside>
        <div class="dash-main"><section class="dash-section"><div class="dash-title"><h2>${ym} 시공관리 현황</h2><button class="btn" data-dashboard-go-construction>시공일정 보기</button></div>${renderDashboardKpi(rows)}</section>${renderWeatherBox()}<section class="dash-section compact"><div class="dash-title"><h2>이번 달 지연/확인 필요</h2></div><div class="linked-list">${rows.filter(({c})=>c.status==="지연"||c.next).slice(0,8).map(({c,i})=>`<button class="linked-item" data-dashboard-construction="${i}"><strong>${esc(c.site)}</strong><div class="meta">${esc(c.status||"-")} · ${esc(c.next||"다음 액션 없음")}</div></button>`).join("")||`<div class="meta">이번 달 특이사항이 없습니다.</div>`}</div></section></div>
        <aside class="dash-side"><section class="dash-section"><div class="mini-calendar-head"><button class="btn icon" data-dashboard-month="-1">‹</button><strong>${esc(els.calendarYear.value||today.slice(0,4))}년 ${esc(els.calendarMonth.value||today.slice(5,7))}월</strong><button class="btn icon" data-dashboard-month="1">›</button></div><div class="mini-calendar">${renderDashboardMiniCalendar()}</div></section><section class="dash-section"><div class="dash-title"><h2>${esc(dashboardDate)} 할일</h2><button class="btn" data-dashboard-today>오늘</button></div><div class="today-list">${dateItems.todos.map(({t,i})=>`<button class="today-item" data-edit-todo="${i}"><strong>${esc(t.title)}</strong><div class="meta">${esc(peopleText(t))} · ${esc(t.status)} · 할일</div></button>`).join("")}${dateItems.assignments.map(({a,i})=>`<button class="today-item" data-open-assignment="${i}"><strong>${esc(a.title)}</strong><div class="meta">${esc(peopleText(a))} · ${esc(a.status)} · 일정</div></button>`).join("")}${dateItems.todos.length+dateItems.assignments.length===0?`<div class="meta">선택한 날짜에 등록된 항목이 없습니다.</div>`:""}</div></section></aside>
      </div>`;
      $("#dashboardProjectSearch")?.addEventListener("input",renderDashboard);
      updateClock();updateWeather();
    }
    renderCalendar=renderDashboard;
    function teamKpiHtml(rows){
      const people=state.people.map(p=>p.name),total=rows.length,done=rows.filter(({t})=>t.status===KR.done).length,late=rows.filter(({t})=>t.status!==KR.done&&t.due&&t.due<today).length,max=Math.max(1,...people.map(p=>rows.filter(({t})=>taskPeople(t).includes(p)).length));
      return `<div class="dash-section compact"><div class="dash-title"><h2>우리팀 KPI</h2><span class="dash-pill">완료율 ${total?Math.round(done/total*100):0}%</span></div><div class="dash-kpi-grid small"><div><div class="label">전체</div><div class="value">${total}</div></div><div><div class="label">완료</div><div class="value">${done}</div></div><div><div class="label">지연</div><div class="value">${late}</div></div></div>${people.map(p=>smallBar(p,rows.filter(({t})=>taskPeople(t).includes(p)).length,max,personColor(p))).join("")}</div>`
    }
    const oldTodoListHtml=todoListHtml;
    todoListHtml=function(rows){return teamKpiHtml(rows)+oldTodoListHtml(rows)}
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.dataset.dashboardConstruction){openConstructionModal(Number(t.dataset.dashboardConstruction))}if(t.dataset.dashboardGoConstruction!==undefined){goToView("construction","시공일정")}if(t.dataset.refreshWeather!==undefined){updateClock();updateWeather()}},true);
    let maskingMode=localStorage.getItem("solar-mask-mode")==="on";
    function applyMasking(){document.body.classList.toggle("masking-mode",maskingMode);const b=$("#addProjectBtn")||$("#maskToggleBtn");if(b&&currentView==="dashboard"){b.id="maskToggleBtn";b.textContent=maskingMode?"마스킹 ON":"마스킹 OFF";b.classList.toggle("primary",!maskingMode);b.dataset.maskToggle="1"}}
    const renderBaseForMask=render;
    render=function(){renderBaseForMask();applyMasking()}
    const cityWeather=[
      {name:"서울",lat:37.5665,lon:126.9780},
      {name:"대전",lat:36.3504,lon:127.3845},
      {name:"대구",lat:35.8714,lon:128.6014},
      {name:"부산",lat:35.1796,lon:129.0756},
      {name:"광주",lat:35.1595,lon:126.8526}
    ];
    function renderWeatherBox(){
      return `<div class="weather-clock-grid">
        <section class="dash-section compact"><div class="dash-title"><h2>날씨</h2><button class="btn" data-refresh-weather>새로고침</button></div><div id="dashWeatherContent" class="weather-grid"><div class="meta">날씨 정보를 불러오는 중입니다.</div></div><div class="label" style="margin-top:12px">대구 7일 예보</div><div id="dashForecastContent" class="forecast-strip"></div></section>
        <section class="dash-section compact time-card"><div class="dash-title"><h2>현재 시간</h2></div><div id="dashClock" class="value" style="font-size:22px"></div><div class="meta">Asia/Seoul 기준</div></section>
      </div>`
    }
    async function updateWeather(){
      const box=$("#dashWeatherContent"),forecast=$("#dashForecastContent");if(!box)return;
      box.innerHTML=`<div class="meta">날씨 정보를 불러오는 중입니다.</div>`;
      try{
        const results=await Promise.all(cityWeather.map(async c=>{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`);const j=await r.json();return{...c,current:j.current,daily:j.daily}}));
        box.innerHTML=results.map(r=>`<div class="weather-city"><strong>${esc(r.name)}</strong><div class="value" style="font-size:20px">${Math.round(r.current.temperature_2m)}°C</div><div class="meta">풍속 ${Math.round(r.current.wind_speed_10m)}m/s</div></div>`).join("");
        const daegu=results.find(r=>r.name==="대구");
        forecast.innerHTML=(daegu?.daily?.time||[]).slice(0,7).map((d,i)=>`<div class="forecast-day"><strong>${d.slice(5).replace("-","/")}</strong><div>${Math.round(daegu.daily.temperature_2m_min[i])}° / ${Math.round(daegu.daily.temperature_2m_max[i])}°</div></div>`).join("");
      }catch{box.innerHTML=`<div class="meta">날씨 정보를 불러오지 못했습니다. 네트워크 상태를 확인하세요.</div>`;if(forecast)forecast.innerHTML=""}
    }
    const dashboardWithWeather=renderDashboard;
    renderDashboard=function(){
      dashboardWithWeather();
      const main=$(".dash-main");
      const weatherHtml=renderWeatherBox();
      const weatherNode=document.createElement("div");
      weatherNode.innerHTML=weatherHtml;
      const oldWeather=[...main.children].find(x=>x.textContent.includes("날씨"));
      if(oldWeather)oldWeather.remove();
      main.insertBefore(weatherNode.firstElementChild,main.firstElementChild);
      updateClock();updateWeather();
    }
    function personCompletionRows(rows){
      return state.people.map(p=>{const rel=rows.filter(({t})=>taskPeople(t).includes(p.name)),done=rel.filter(({t})=>t.status===KR.done).length,rate=rel.length?Math.round(done/rel.length*100):0;return{p,rel,done,rate}});
    }
    teamKpiHtml=function(rows){
      const total=rows.length,done=rows.filter(({t})=>t.status===KR.done).length,late=rows.filter(({t})=>t.status!==KR.done&&t.due&&t.due<today).length,people=personCompletionRows(rows);
      return `<div class="dash-section compact"><div class="dash-title"><h2>우리팀 KPI</h2><span class="dash-pill">전체 완료율 ${total?Math.round(done/total*100):0}%</span></div><div class="dash-kpi-grid small"><div><div class="label">전체</div><div class="value">${total}</div></div><div><div class="label">완료</div><div class="value">${done}</div></div><div><div class="label">지연</div><div class="value">${late}</div></div></div>${people.map(x=>smallBar(`${x.p.name} ${x.rate}%`,x.done,Math.max(1,x.rel.length),x.p.color||personColor(x.p.name))).join("")}</div>`
    }
    todoListHtml=function(rows){
      const sorted=todoFilteredRows(rows);
      const table=`<div class="todo-list"><div class="todo-list-row head"><span>${todoSortButton("title","제목")}</span><span>${todoSortButton("owner","담당")}</span><span>${todoSortButton("status","상태")}</span><span>${todoSortButton("priority","우선")}</span><span>${todoSortButton("due","마감")}</span><span>관리</span></div><div class="todo-list-row filter"><span>${todoListFilterInput("title","제목")}</span><span>${todoListFilterInput("owner","담당")}</span><span>${todoListFilterInput("status","상태")}</span><span>${todoListFilterInput("priority","우선")}</span><span>${todoListFilterInput("due","마감")}</span><span></span></div>${sorted.length?sorted.map(({t,i})=>`<div class="todo-list-row" style="border-left:5px solid ${esc(personColor(t.owner))}"><strong>${esc(t.title)}</strong><span>${esc(peopleText(t))}</span><span><span class="badge ${statusClass(t.status)}">${esc(t.status)}</span></span><span>${esc(t.priority||KR.normal)}</span><span>${esc(t.due||"")}</span><span><button class="btn icon" data-edit-todo="${i}">수정</button><button class="btn icon danger" data-delete-todo="${i}">삭제</button></span></div>`).join(""):`<div class="todo-list-row"><span class="meta">조건에 맞는 할일이 없습니다.</span></div>`}</div>`;
      return teamKpiHtml(rows)+table;
    }
    document.addEventListener("click",e=>{
      const t=e.target.closest("button")||e.target;
      if(t.dataset.maskToggle){e.preventDefault();e.stopImmediatePropagation();maskingMode=!maskingMode;localStorage.setItem("solar-mask-mode",maskingMode?"on":"off");applyMasking();return}
      if(t.dataset.todoView==="list"&&!adminUnlocked){if(!unlockAdmin()){todoViewMode="board";setTimeout(renderTodoBoard,0);e.preventDefault();e.stopPropagation()}}
    },true);
    function localDateValue(v){
      const m=String(v||"").match(/^(\d{4})-(\d{2})-(\d{2})/);
      return m?new Date(Number(m[1]),Number(m[2])-1,Number(m[3])):null;
    }
    function overdueDays(due){
      const d=localDateValue(due),now=localDateValue(today);
      return d&&now?Math.max(0,Math.floor((now-d)/86400000)):0;
    }
    function overdueTodoRows(){
      return state.todos.map((t,i)=>({t:normalizeTodo(t),i}))
        .filter(({t})=>t.due&&t.status!==KR.done&&t.due<today)
        .sort((a,b)=>overdueDays(b.t.due)-overdueDays(a.t.due));
    }
    function overdueWarningHtml(){
      const rows=overdueTodoRows();
      return `<section class="dash-section compact" style="border:2px solid #f5b800;background:#fffdf2">
        <div class="dash-title"><h2>마감 경과 업무 경고</h2><span class="dash-pill" style="background:#fff1cc;color:#8a4b00">지연 ${rows.length}</span></div>
        <div class="linked-list">
          ${rows.length?rows.slice(0,10).map(({t,i})=>{
            const days=overdueDays(t.due);
            return `<button class="linked-item" data-edit-todo="${i}" style="border-left:5px solid #ef4444;background:#fff7f7;text-align:left">
              <strong>${esc(t.title||"제목 없는 할일")}</strong>
              <div class="meta">${esc(peopleText(t))} · ${esc(t.status||"-")} · 마감 ${esc(t.due)} · <b style="color:#b91c1c">${days}일 경과</b></div>
              <div class="meta">${esc(t.project||KR.general)} · ${esc(t.priority||KR.normal)}</div>
            </button>`
          }).join(""):`<div class="meta">마감 지난 업무가 없습니다.</div>`}
        </div>
      </section>`;
    }
    function dashboardRiskRows(){
      const base=assignmentCalendarDefaultDate();
      const baseDate=localDateValue(base),soonLimit=new Date(baseDate);soonLimit.setDate(soonLimit.getDate()+3);
      const makeDate=t=>localDateValue(t.due||t.end||t.start);
      const isExpiredToday=(item,date)=>date===base&&item.endTime&&!item.allDay&&new Date(`${date}T${item.endTime}`)<new Date();
      return state.todos.map((t,i)=>({kind:"할일",item:normalizeTodo(t),i,edit:`data-edit-todo="${i}"`}))
        .concat(state.assignments.map((a,i)=>({kind:"일정",item:normalizeAssignment(a),i,edit:`data-open-assignment="${i}"`})))
        .map(row=>({...row,d:makeDate(row.item)}))
        .filter(row=>row.d&&row.item.status!==KR.done&&localDateString(row.d).slice(0,7)===base.slice(0,7))
        .map(row=>{
          const date=localDateString(row.d),late=row.d<baseDate||isExpiredToday(row.item,date)||String(row.item.status||"").includes("지연");
          const soon=!late&&row.d<=soonLimit;
          return {...row,date,level:late?"late":soon?"soon":""};
        })
        .filter(row=>row.level)
        .sort((a,b)=>a.d-b.d);
    }
    function renderDashboardRiskHtml(){
      const rows=dashboardRiskRows();
      return `<section class="dash-section compact">
        <div class="dash-title"><h2>이번 달 지연/확인 필요</h2><span class="dash-pill">확인 ${rows.length}</span></div>
        <div class="dashboard-risk-list">
          ${rows.length?rows.slice(0,8).map(row=>`<button class="risk-item risk-${row.level}" ${row.edit}>
            <strong>${row.level==="late"?"지연확정":"마감 임박"} · ${esc(row.item.title||"제목 없는 항목")}</strong>
            <div class="meta">${esc(peopleText(row.item))} · ${esc(row.item.status||"-")} · ${esc(row.date)} · ${row.kind}</div>
            <div class="meta">${esc(row.item.project||row.item.location||KR.general)} · ${esc(row.item.priority||KR.normal)}</div>
          </button>`).join(""):`<div class="meta">이번 달 특이사항이 없습니다.</div>`}
        </div>
      </section>`;
    }
    function dashboardMemoText(){return localStorage.getItem("solar-dashboard-memo")||""}
    function renderDashboardMemo(){
      return `<section class="dash-section compact">
        <div class="dash-title"><h2>메모</h2><span class="dash-pill">대시보드</span></div>
        <textarea id="dashboardMemoText" class="dashboard-memo-box" placeholder="회의 내용, 현장 확인 사항, 전달 메모를 입력하세요.">${esc(dashboardMemoText())}</textarea>
      </section>`;
    }
    function renderWeatherBox(){
      return `<div class="dash-kpi-grid" style="grid-template-columns:minmax(0,1fr) 260px">
        <section class="dash-section compact"><div class="dash-title"><h2>🏗️ 시공 기상정보</h2><button class="btn" data-refresh-weather>새로고침</button></div><div id="dashWeatherContent" class="weather-grid"><div class="meta">기상 정보를 불러오는 중입니다.</div></div><div class="label" style="margin-top:12px">대구 7일 시공 예보</div><div id="dashForecastContent" class="forecast-strip"></div></section>
        <section class="dash-section compact time-card"><div class="dash-title"><h2>현재 시간</h2></div><div id="dashClock" class="value" style="font-size:22px"></div><div class="meta">Asia/Seoul 기준</div></section>
      </div>`;
    }
    async function updateWeather(){
      const box=$("#dashWeatherContent"),forecast=$("#dashForecastContent");if(!box)return;
      box.innerHTML=`<div class="meta">기상 정보를 불러오는 중입니다.</div>`;
      try{
        const nowH=new Date().getHours();
        const results=await Promise.all(cityWeather.map(async c=>{
          const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,wind_speed_10m,cloudcover,weathercode&hourly=precipitation_probability,uv_index&daily=precipitation_probability_max,precipitation_sum,temperature_2m_max,temperature_2m_min,sunshine_duration&timezone=Asia%2FSeoul&forecast_days=7`);
          const j=await r.json();
          const todayStr=(j.hourly?.time?.[0]||"").slice(0,10);
          const hIdx=j.hourly?.time?.findIndex(t=>t===`${todayStr}T${String(nowH).padStart(2,"0")}:00`)??-1;
          const precipNow=hIdx>=0?(j.hourly.precipitation_probability[hIdx]??j.daily.precipitation_probability_max[0]):j.daily.precipitation_probability_max[0];
          const uvNow=hIdx>=0?Math.round(j.hourly.uv_index?.[hIdx]||0):0;
          return{...c,current:j.current,daily:j.daily,precipNow:Math.round(precipNow||0),uvNow};
        }));
        const wxIcon=p=>p>=70?"🌧️":p>=40?"🌦️":p>=20?"⛅":"☀️";
        const workAdvice=(prob,wind)=>{
          if(wind>=12)return{txt:"⛔ 강풍 작업불가",col:"#b91c1c"};
          if(prob>=70)return{txt:"🌧️ 우천 작업불가",col:"#b91c1c"};
          if(wind>=8)return{txt:"⚠️ 강풍 주의",col:"#b45309"};
          if(prob>=40)return{txt:"⚠️ 우천 주의",col:"#b45309"};
          return{txt:"✅ 시공 가능",col:"#16a34a"};
        };
        box.innerHTML=results.map(r=>{
          const prob=r.precipNow,temp=Math.round(r.current?.temperature_2m||0);
          const tMax=Math.round(r.daily?.temperature_2m_max?.[0]||temp),tMin=Math.round(r.daily?.temperature_2m_min?.[0]||temp);
          const wind=Math.round((r.current?.wind_speed_10m||0)*10)/10;
          const cloud=Math.round(r.current?.cloudcover||0),uv=r.uvNow;
          const adv=workAdvice(prob,wind);
          const danger=prob>=70||wind>=12,warn=prob>=40||wind>=8;
          const borderCol=danger?"#ef4444":warn?"#f59e0b":"#a7f3d0";
          const bgCol=danger?"#fff5f5":warn?"#fff8e6":"";
          return `<div class="weather-city" style="border-color:${borderCol};${bgCol?"background:"+bgCol:""}">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
              <span style="font-size:22px;line-height:1">${wxIcon(prob)}</span>
              <strong style="font-size:14px">${esc(r.name)}</strong>
            </div>
            <div style="font-size:26px;font-weight:800;color:${danger?"#b91c1c":warn?"#b45309":"#0d9488"};line-height:1">${prob}%</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:1px">강수확률 (현재시간)</div>
            <div style="margin-top:7px;padding-top:7px;border-top:1px solid rgba(0,0,0,.07)">
              <div style="display:flex;align-items:baseline;gap:3px">
                <span style="font-size:18px;font-weight:700;color:#334155">${temp}℃</span>
                <span style="font-size:10px;color:#94a3b8">${tMin}~${tMax}℃</span>
              </div>
              <div style="font-size:11px;color:#64748b;margin-top:5px;display:grid;grid-template-columns:1fr 1fr;gap:3px 6px">
                <span>☁️ 구름 ${cloud}%</span><span>💨 ${wind}m/s</span>
                <span>🌞 UV ${uv}</span><span style="color:${adv.col};font-weight:700">${adv.txt}</span>
              </div>
            </div>
          </div>`;
        }).join("");
        const daegu=results.find(r=>r.name==="대구")||results[2];
        if(forecast)forecast.innerHTML=(daegu?.daily?.time||[]).slice(0,7).map((d,i)=>{
          const prob=Math.round(daegu.daily.precipitation_probability_max?.[i]||0);
          const sum=(daegu.daily.precipitation_sum?.[i]||0).toFixed(1);
          const max=Math.round(daegu.daily.temperature_2m_max?.[i]||0),min=Math.round(daegu.daily.temperature_2m_min?.[i]||0);
          const sun=Math.round((daegu.daily.sunshine_duration?.[i]||0)/3600);
          const bad=prob>=70,warn=prob>=40&&prob<70;
          const col=bad?"#b91c1c":warn?"#b45309":"#0d9488";
          return `<div class="forecast-day" style="${bad?"border-color:#ef4444;background:#fff5f5":warn?"border-color:#f59e0b;background:#fff8e6":""}">
            <div style="font-size:16px;margin-bottom:2px">${wxIcon(prob)}</div>
            <strong style="font-size:11px">${d.slice(5).replace("-","/")}</strong>
            <div style="font-size:13px;font-weight:800;color:${col}">${prob}%</div>
            <div style="font-size:10px;color:#94a3b8">${min}~${max}℃</div>
            <div style="font-size:10px;color:#94a3b8">☀️${sun}h</div>
          </div>`;
        }).join("");
      }catch(e){box.innerHTML=`<div class="meta">날씨 정보를 불러오지 못했습니다. 네트워크 상태를 확인하세요.</div>`;if(forecast)forecast.innerHTML=""}
    }
    renderDashboard=function(){
      ensureConfigLists();ensureTaskLinks();
      syncViewChrome();
      els.dashboardView.classList.add("dashboard-workspace");
      const rows=constructionMonthRows(),q=($("#dashboardProjectSearch")?.value||"").toLowerCase(),shown=rows.filter(({c})=>[c.site,c.company,c.customer,c.phase,c.status,c.owner].join(" ").toLowerCase().includes(q));
      const dateItems=dashboardDateItems(dashboardDate),ym=monthValue();
      els.dashboardView.innerHTML=`<div class="workspace-dashboard">
        <aside class="dash-column"><section class="dash-section"><div class="dash-title"><h2>시공일정</h2><button class="btn primary" data-dashboard-add-construction>추가</button></div><input class="project-search" id="dashboardProjectSearch" placeholder="현장, 시공사, 담당 검색" value="${esc($("#dashboardProjectSearch")?.value||"")}"><div class="dash-link-row"><span class="dash-pill">${ym}</span><span class="dash-pill">월 공사 ${rows.length}</span><span class="dash-pill">지연 ${statusCount(rows,"지연")}</span></div><div class="project-list">${shown.length?shown.map(({c,i})=>`<button class="project-item" data-dashboard-construction="${i}"><span class="project-name">${esc(c.site||"이름 없는 발전소")}</span><span class="project-meta">${esc(c.company||"-")} · ${esc(c.kw||0)}kW · ${esc(c.status||"예정")}</span><span class="project-meta">${esc(c.phase||"-")} · ${esc(c.start||"-")} ~ ${esc(c.end||"")}</span></button>`).join(""):`<div class="dash-empty">${ym} 공사가 없습니다.</div>`}</div></section></aside>
        <div class="dash-main"><section class="dash-section"><div class="dash-title"><h2>${ym} 시공관리 현황</h2><button class="btn" data-dashboard-go-construction>시공일정 보기</button></div>${renderDashboardKpi(rows)}</section>${renderDashboardRiskHtml()}${renderDashboardMemo()}</div>
        <aside class="dash-side"><section class="dash-section"><div class="mini-calendar-head"><button class="btn icon" data-dashboard-month="-1">‹</button><strong>${esc(els.calendarYear.value||today.slice(0,4))}년 ${esc(els.calendarMonth.value||today.slice(5,7))}월</strong><button class="btn icon" data-dashboard-month="1">›</button></div><div class="mini-calendar">${renderDashboardMiniCalendar()}</div></section><section class="dash-section"><div class="dash-title"><h2>${esc(dashboardDate)} 할일</h2><button class="btn" data-dashboard-today>오늘</button></div><div class="today-list">${dateItems.todos.map(({t,i})=>`<button class="today-item" data-edit-todo="${i}"><strong>${esc(t.title)}</strong><div class="meta">${esc(peopleText(t))} · ${esc(t.status)} · 할일</div></button>`).join("")}${dateItems.assignments.map(({a,i})=>`<button class="today-item" data-open-assignment="${i}"><strong>${esc(a.title)}</strong><div class="meta">${esc(peopleText(a))} · ${esc(a.status)} · 일정</div></button>`).join("")}${dateItems.todos.length+dateItems.assignments.length===0?`<div class="meta">선택한 날짜에 등록된 항목이 없습니다.</div>`:""}</div></section></aside>
      </div>`;
      $("#dashboardProjectSearch")?.addEventListener("input",renderDashboard);
      updateClock();updateWeather();applyMasking();
    }
    function applyQuickDuration(prefix,min){const start=$("#"+prefix+"Start"),startTime=$("#"+prefix+"StartTime"),due=$("#"+(prefix==="todo"?"todoDue":"assignmentDue")),endTime=$("#"+(prefix==="todo"?"todoEndTime":"assignmentEndTime")),allDay=$("#"+prefix+"AllDay");if(allDay)allDay.checked=false;if(!start.value)start.value=today;if(!startTime.value)startTime.value="09:00";const [h,m]=startTime.value.split(":").map(Number),d=new Date(start.value+"T00:00:00");d.setHours(h||0,m||0,0,0);d.setMinutes(d.getMinutes()+Number(min||60));due.value=localDateString(d);endTime.value=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");$$(`[data-${prefix==="todo"?"todo-duration":"duration"}-min]`).forEach(b=>b.classList.toggle("primary",b.dataset[prefix==="todo"?"todoDurationMin":"durationMin"]===String(min)));$$(`[data-${prefix==="todo"?"todo-duration":"duration"}-all-day]`).forEach(b=>b.classList.remove("primary"))}
    function applyAllDay(prefix){const start=$("#"+prefix+"Start"),due=$("#"+(prefix==="todo"?"todoDue":"assignmentDue")),allDay=$("#"+prefix+"AllDay");if(!start.value)start.value=today;due.value=start.value;if(allDay)allDay.checked=true;$$(`[data-${prefix==="todo"?"todo-duration":"duration"}-min]`).forEach(b=>b.classList.remove("primary"));$$(`[data-${prefix==="todo"?"todo-duration":"duration"}-all-day]`).forEach(b=>b.classList.add("primary"))}
    setTimeByDuration=function(min){applyQuickDuration("assignment",min)}
    setTodoTimeByDuration=function(min){applyQuickDuration("todo",min)}
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.dataset.durationAllDay){e.preventDefault();applyAllDay("assignment")}if(t.dataset.todoDurationAllDay){e.preventDefault();applyAllDay("todo")}},true);
    document.addEventListener("change",e=>{const t=e.target;if(t.id==="assignmentAllDay"&&t.checked)applyAllDay("assignment");if(t.id==="todoAllDay"&&t.checked)applyAllDay("todo")},true);
    function currentTodoFormForKakao(){const helpers=readHelperChecks("todoHelpers"),people=[$("#todoOwner").value,...helpers].filter(Boolean);return normalizeTodo({title:$("#todoTitle").value||KR.emptyTodo,owner:$("#todoOwner").value,helpers,project:$("#todoProject").value,type:$("#todoType").value,status:$("#todoStatus").value,priority:$("#todoPriority").value,start:$("#todoStart").value||today,due:$("#todoDue").value||today,startTime:$("#todoStartTime").value||"",endTime:$("#todoEndTime").value||"",allDay:$("#todoAllDay").checked,repeat:$("#todoRepeat").value,location:$("#todoLocation").value,detail:$("#todoDetail").value,result:$("#todoResult").value,peopleText:people.join(", ")})}
    function todoKakaoMessage(t){const due=t.due||t.start;const meta=[due?`📅 ${due}`:"",t.status?t.status:""].filter(Boolean).join(" | ");return [t.title||KR.emptyTodo,meta,t.detail||""].filter(Boolean).join("\n")}
    document.addEventListener("click",async e=>{const t=e.target.closest("button")||e.target;if(t.id==="todoGoogleCalendarBtn"){e.preventDefault();e.stopImmediatePropagation();window.open(googleCalendarUrl(currentTodoFormForKakao()),"_blank");return}if(t.id==="kakaoTodoBtn"){e.preventDefault();$("#kakaoTodoText").value=todoKakaoMessage(currentTodoFormForKakao());$("#kakaoTodoModal").classList.add("open");$("#kakaoTodoText").focus();$("#kakaoTodoText").select()}if(t.id==="copyKakaoTodoBtn"){e.preventDefault();const text=$("#kakaoTodoText").value;try{await navigator.clipboard.writeText(text);toast("카톡 메시지를 복사했습니다.")}catch{$("#kakaoTodoText").focus();$("#kakaoTodoText").select();document.execCommand("copy");toast("카톡 메시지를 복사했습니다.")}if(editingTodoIndex!==null)markTodoKakaoShared(editingTodoIndex,true,false)}if(t.id==="openKakaoTodoBtn"){e.preventDefault();try{await navigator.clipboard.writeText($("#kakaoTodoText").value)}catch{}if(editingTodoIndex!==null)markTodoKakaoShared(editingTodoIndex,true,false);toast("복사했습니다. 카톡 대화창에 붙여넣으세요.");location.href="kakaotalk://"}},true);
    let _stepAutoDetail="";
    function _syncStepToDetail(){const d=$("#todoDetail");if(!d)return;if(d.value&&d.value!==_stepAutoDetail)return;const steps=readTodoSteps().filter(s=>s.title);if(!steps.length){return}const txt=steps.map(s=>`${s.done?"☑":"□"} ${s.title}${s.due?` (~${s.due})`:""}`).join("\n");d.value=_stepAutoDetail=txt}
    document.addEventListener("input",e=>{if(e.target.matches("[data-todo-step-title]"))_syncStepToDetail()},true);
    document.addEventListener("change",e=>{if(e.target.matches("[data-todo-step-done],[data-todo-step-due]"))_syncStepToDetail()},true);
    (function setupConstructionKakaoMessage(){
      function ensureConstructionKakaoButton(){
        const head=$("#constructionModal .modal-head");
        if(!head||$("#kakaoConstructionBtn"))return;
        const search=head.querySelector(".construction-db-search")||head.querySelector("[data-close='constructionModal']");
        search?.insertAdjacentHTML("beforebegin",`<button class="btn primary" id="kakaoConstructionBtn" type="button">카톡메세지</button>`);
      }
      const baseOpenConstructionForKakao=openConstructionModal;
      openConstructionModal=function(...args){baseOpenConstructionForKakao(...args);ensureConstructionKakaoButton()};
      function currentConstructionForm(){
        return {
          company:$("#constructionCompany")?.value||"",
          structureTeam:$("#constructionStructureTeam")?.value||"",
          site:$("#constructionSite")?.value||"",
          kw:$("#constructionKw")?.value||"",
          sales:$("#constructionSales")?.value||"",
          customer:$("#constructionCustomer")?.value||"",
          phase:$("#constructionPhase")?.value||"",
          owner:$("#constructionOwner")?.value||"",
          start:$("#constructionStart")?.value||"",
          end:$("#constructionEnd")?.value||"",
          duration:$("#constructionDuration")?.value||"",
          status:$("#constructionStatus")?.value||"",
          next:$("#constructionNext")?.value||""
        };
      }
      function constructionKakaoMessage(c){
        const period=[c.start,c.end].filter(Boolean).join(" ~ ");
        return [
          `현장명: ${c.site||"미입력"}`,
          `고객: ${c.customer||"미입력"}`,
          `용량: ${c.kw||"0"}kW`,
          `시공사: ${c.company||"미입력"}`,
          `구조물팀: ${c.structureTeam||"미입력"}`,
          `영업자: ${c.sales||"미입력"}`,
          `담당: ${c.owner||"미입력"}`,
          `업무단계: ${c.phase||"미입력"}`,
          `상태: ${c.status||"미입력"}`,
          `일정: ${period||"미입력"}`,
          `소요일: ${c.duration||"미입력"}`,
          "",
          c.next?`참고사항:\n${c.next}`:""
        ].filter(v=>v!==null&&v!==undefined).join("\n").replace(/\n{3,}/g,"\n\n").trim();
      }
      document.addEventListener("click",async e=>{
        const t=e.target.closest("button")||e.target;
        if(t.id==="kakaoConstructionBtn"){
          e.preventDefault();e.stopImmediatePropagation();
          $("#kakaoConstructionText").value=constructionKakaoMessage(currentConstructionForm());
          $("#kakaoConstructionModal").classList.add("open");
          $("#kakaoConstructionText").focus();
          $("#kakaoConstructionText").select();
        }
        if(t.id==="copyKakaoConstructionBtn"){
          e.preventDefault();
          const text=$("#kakaoConstructionText").value;
          try{await navigator.clipboard.writeText(text);toast("재무팀 카톡메세지를 복사했습니다.")}
          catch{$("#kakaoConstructionText").focus();$("#kakaoConstructionText").select();document.execCommand("copy");toast("재무팀 카톡메세지를 복사했습니다.")}
        }
        if(t.id==="openKakaoConstructionBtn"){
          e.preventDefault();
          try{await navigator.clipboard.writeText($("#kakaoConstructionText").value)}catch{}
          toast("복사했습니다. 재무팀 카톡방에 붙여넣으세요.");
          location.href="kakaotalk://";
        }
      },true);
    })();
    function applyMasking(){document.body.classList.toggle("masking-mode",maskingMode);const b=$("#maskToggleBtn"),add=$("#addProjectBtn");if(b){b.textContent=maskingMode?"마스킹 ON":"마스킹 OFF";b.classList.toggle("primary",true);b.setAttribute("aria-pressed",maskingMode?"true":"false")}if(add)add.style.display=currentView==="dashboard"?"none":""}
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.id==="maskToggleBtn"||t.dataset.maskToggle){e.preventDefault();e.stopImmediatePropagation();pulseTopButton(t,maskingMode?"마스킹을 해제합니다.":"마스킹을 켭니다.");maskingMode=!maskingMode;localStorage.setItem("solar-mask-mode",maskingMode?"on":"off");applyMasking();updateTopButtons()}},true);
    document.addEventListener("input",e=>{
      if(e.target?.id==="dashboardMemoText")localStorage.setItem("solar-dashboard-memo",e.target.value||"");
    },true);
    function dashboardDefaultDate(){return assignmentCalendarDefaultDate()}
    function resetDashboardToToday(){dashboardDate=dashboardDefaultDate();setCalendarMonth(els.calendarYear,els.calendarMonth,dashboardDate)}
    function syncViewChrome(){
      if(currentView==="dashboard"){
        els.pageTitle.textContent="대시보드";els.pageSub.textContent="시공 일정과 할일, 날씨를 한 화면에서 확인합니다.";els.tableTitle.textContent="시공일정";
        $("#addProjectBtn").textContent="현장 추가";$("#addContentBtn").textContent="추가";
      }else if(currentView==="assignments"){
        els.pageTitle.textContent="일정관리";els.pageSub.textContent="회의는 짧게, 성과는 길게 가면 좋겠습니다.";els.tableTitle.textContent="일정관리";
        $("#addProjectBtn").textContent="일정 등록";$("#addContentBtn").textContent="일정 등록";
      }else if(currentView==="todos"){
        els.pageTitle.textContent="할일관리";els.pageSub.textContent="작게 쪼개면 일도 덜 무서워 보입니다.";els.tableTitle.textContent="할일관리";
        $("#addProjectBtn").textContent="할일 추가";$("#addContentBtn").textContent="할일 추가";
      }
    }
    function assignmentCalendarDefaultDate(){
      const buildDate="2026-06-01";
      const validToday=/^\d{4}-\d{2}-\d{2}$/.test(today)?today:buildDate;
      return validToday<buildDate?buildDate:validToday;
    }
    function resetAssignmentCalendarToToday(){setCalendarMonth(els.assignmentCalendarYear,els.assignmentCalendarMonth,assignmentCalendarDefaultDate())}
    const baseRenderCurrentContentForCalendar=renderCurrentContent;
    renderCurrentContent=function(){
      if(currentView==="dashboard")resetDashboardToToday();
      if(currentView==="assignments")resetAssignmentCalendarToToday();
      baseRenderCurrentContentForCalendar();
      syncViewChrome();
      if(currentView==="dashboard"){resetDashboardToToday();renderDashboard()}
      if(currentView==="assignments"){resetAssignmentCalendarToToday();renderAssignmentCalendar()}
    }
    const baseRenderAssignmentCalendarForDefaultDate=renderAssignmentCalendar;
    renderAssignmentCalendar=function(){
      if(currentView==="assignments"){
        const shown=`${els.assignmentCalendarYear.value}-${els.assignmentCalendarMonth.value}`;
        if(shown<assignmentCalendarDefaultDate().slice(0,7))resetAssignmentCalendarToToday();
      }
      baseRenderAssignmentCalendarForDefaultDate();
    }
    const baseGoToViewForCalendar=goToView;
    goToView=function(view,label=""){const previousView=currentView,addBtn=$("#addProjectBtn");if(addBtn&&addBtn.id!=="addProjectBtn"){addBtn.id="addProjectBtn";delete addBtn.dataset.maskToggle}if(view==="dashboard")resetDashboardToToday();if(view==="assignments")resetAssignmentCalendarToToday();baseGoToViewForCalendar(view,label);syncViewChrome();if(view==="dashboard"){resetDashboardToToday();renderDashboard()}if(view==="assignments"){resetAssignmentCalendarToToday();renderAssignmentCalendar()}if(view==="todos"&&previousView!=="todos")setTimeout(()=>showMyWorkPopup(false),0);applyMasking()}
    function addressMeta(item){return item?.location?`<div class="todo-card-meta">주소: ${esc(item.location)}</div>`:""}
    function compactAddress(item){return item?.location?` · 주소: ${esc(item.location)}`:""}
    document.addEventListener("click",e=>{
      if(e.target?.id==="assignmentModal"||e.target?.id==="todoModal")e.target.classList.remove("open");
    });
    function resetTaskModalScroll(id){
      requestAnimationFrame(()=>{const modal=$("#"+id+" .modal");if(modal)modal.scrollTop=0});
    }
    function defaultTodoSteps(baseDate=today){
      return [{title:"",due:"",done:false}];
    }
    function normalizeTodoSteps(steps,baseDate=today){
      const list=Array.isArray(steps)&&steps.length?steps:defaultTodoSteps(baseDate);
      const oldDefaults=new Set(["지시 확인","현장 방문","자재 발주","작업 진행","완료 확인"]);
      const normalized=list.map(s=>{const title=String(s.title||"").trim();return{title:oldDefaults.has(title)?"":title,due:s.due||"",done:!!s.done}});
      const meaningful=normalized.filter(s=>s.title||s.done);
      if(!meaningful.length)return defaultTodoSteps(baseDate);
      return normalized.filter(s=>s.title||s.due||s.done);
    }
    function todoProgress(t){
      const steps=normalizeTodoSteps(t?.steps||[],t?.start||t?.due||today),done=steps.filter(s=>s.done).length,total=steps.length||1;
      return{steps,done,total,pct:Math.round(done/total*100)};
    }
    function renderTodoSteps(steps){
      _stepAutoDetail="";
      const box=$("#todoSteps");if(!box)return;
      const p=todoProgress({steps});
      box.innerHTML=`<div class="todo-progress"><div class="todo-progress-track"><div class="todo-progress-fill" style="width:${p.pct}%"></div></div><span>${p.pct}%</span></div>${p.steps.map((s,i)=>`<div class="todo-step-row"><input type="checkbox" data-todo-step-done="${i}" ${s.done?"checked":""}><input type="text" data-todo-step-title="${i}" value="${esc(s.title)}" placeholder="진행 단계 입력"><input type="date" data-todo-step-due="${i}" value="${esc(s.due)}"><button class="todo-step-remove" type="button" data-remove-todo-step="${i}">×</button></div>`).join("")}<div class="todo-step-toolbar"><button class="btn" type="button" id="addTodoStepBtn">단계 추가</button><button class="btn" type="button" id="resetTodoStepsBtn">빈 단계</button></div>`;
    }
    function readTodoSteps(){
      const rows=[...$$(".todo-step-row")];
      return rows.map(row=>{const done=!!row.querySelector("[data-todo-step-done]")?.checked,title=row.querySelector("[data-todo-step-title]")?.value.trim()||"",due=row.querySelector("[data-todo-step-due]")?.value||"";return{done,title:done&&!title?"완료":title,due}}).filter(s=>s.title||s.due||s.done);
    }
    function autoCompleteTodoFromSteps(){
      const status=$("#todoStatus"),steps=readTodoSteps();
      if(!status||status.value==="완료"||!steps.length)return false;
      if(steps.every(s=>s.done)){
        status.value="완료";
        syncTodoStatusStep();
        return true;
      }
      return false;
    }
    function resetOpenTodoSteps(steps,baseDate=today){
      const openSteps=(Array.isArray(steps)?steps:[]).filter(s=>s.title!=="완료").map(s=>({...s,done:false}));
      return openSteps.length?openSteps:defaultTodoSteps(baseDate);
    }
    function stepsForTodoStatus(status,steps,baseDate=today){
      if(status!=="완료")return resetOpenTodoSteps(steps,baseDate);
      const completedAt=localDateString(new Date()),next=Array.isArray(steps)?steps.slice():[];
      let target=next.find(s=>s.title==="완료")||next.find(s=>!s.title);
      if(!target){target={title:"",due:"",done:false};next.push(target)}
      target.title="완료";target.due=completedAt;target.done=true;
      return next;
    }
    function applyTodoStatusRules(todo){
      if(!todo)return todo;
      todo.steps=stepsForTodoStatus(todo.status,todo.steps,todo.start||todo.due||today);
      return todo;
    }
    function syncTodoStatusStep(){
      const status=$("#todoStatus")?.value;
      renderTodoSteps(stepsForTodoStatus(status,readTodoSteps(),$("#todoStart")?.value||$("#todoDue")?.value||today));
    }
    function cardProgressHtml(t){
      const p=todoProgress(t);
      return `<div class="todo-card-progress"><div class="todo-progress-track"><div class="todo-progress-fill" style="width:${p.pct}%"></div></div><span>${p.pct}%</span></div>`;
    }
    const openTodoModalScrollTop=openTodoModal;
    openTodoModal=function(...args){openTodoModalScrollTop(...args);const i=args[0],t=i===null||i===undefined?{start:$("#todoStart")?.value||today,due:$("#todoDue")?.value||today}:state.todos[Number(i)]||{};renderTodoSteps(normalizeTodoSteps(t.steps,t.start||t.due||today));resetTaskModalScroll("todoModal")}
    const openAssignmentModalScrollTop=openAssignmentModal;
    openAssignmentModal=function(...args){openAssignmentModalScrollTop(...args);resetTaskModalScroll("assignmentModal")}
    const normalizeTodoWithSteps=normalizeTodo;
    normalizeTodo=function(t){t=normalizeTodoWithSteps(t);t.steps=normalizeTodoSteps(t.steps,t.start||t.due||today);return t}
    $("#saveTodoBtn").onclick=()=>{syncTodoStatusStep();const prev=editingTodoIndex!==null?state.todos[editingTodoIndex]:{};const t=applyTodoStatusRules(normalizeTodo({title:$("#todoTitle").value||KR.emptyTodo,owner:$("#todoOwner").value,helpers:readHelperChecks("todoHelpers"),project:$("#todoProject").value,type:$("#todoType").value,status:$("#todoStatus").value,priority:$("#todoPriority").value,start:$("#todoStart").value||today,due:$("#todoDue").value||today,startTime:$("#todoStartTime").value||"09:00",endTime:$("#todoEndTime").value||"10:00",allDay:$("#todoAllDay").checked,repeat:$("#todoRepeat").value,location:$("#todoLocation").value,detail:$("#todoDetail").value,result:$("#todoResult").value,steps:readTodoSteps(),updatedAt:new Date().toISOString(),kakaoSharedAt:prev.kakaoSharedAt,kakaoSharedBy:prev.kakaoSharedBy}));if(editingTodoIndex!==null){t.id=state.todos[editingTodoIndex].id;t.linkedAssignmentId=state.todos[editingTodoIndex].linkedAssignmentId}editingTodoIndex===null?state.todos.unshift(t):state.todos[editingTodoIndex]=t;syncTodoToAssignment(editingTodoIndex===null?0:editingTodoIndex);setCalendarMonth(els.calendarYear,els.calendarMonth,t.due);setCalendarMonth(els.assignmentCalendarYear,els.assignmentCalendarMonth,t.start||t.due);$("#todoModal").classList.remove("open");render();saveStateAfterPaint("할일과 진행 단계를 저장했습니다.")}
    document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.id==="addTodoStepBtn"){const steps=readTodoSteps();steps.push({title:"",due:$("#todoDue")?.value||today,done:false});renderTodoSteps(steps)}if(t.id==="resetTodoStepsBtn"){renderTodoSteps(defaultTodoSteps($("#todoStart")?.value||today))}if(t.dataset.removeTodoStep){const steps=readTodoSteps();steps.splice(Number(t.dataset.removeTodoStep),1);renderTodoSteps(steps.length?steps:defaultTodoSteps($("#todoStart")?.value||today))}},true);
    document.addEventListener("change",e=>{if(e.target?.dataset.todoStepDone!==undefined){if(!autoCompleteTodoFromSteps())renderTodoSteps(readTodoSteps())}},true);
    document.addEventListener("change",e=>{if(e.target?.id==="todoStatus")syncTodoStatusStep()},true);
    assignmentTaskHtml=function(t){const i=state.assignments.indexOf(t),c=personColor(t.owner),addr=t.location?`<br>주소: ${esc(t.location)}`:"";return `<div class="calendar-task" style="border-left-color:${esc(c)};background:${esc(hexToRgba(c,.22))}" data-open-assignment="${i}" title="${esc([t.detail,t.location].filter(Boolean).join(" / ")||t.title)}"><span class="color-dot" style="background:${esc(c)}"></span>${esc(peopleText(t))} · ${esc(t.title)}<br>${esc(t.status)} · ${esc(t.priority)}${addr}</div>`}
    const renderTodoBoardWithAddress=renderTodoBoard;
    renderTodoBoard=function(){
      renderTodoBoardWithAddress();
      $$(".todo-card").forEach(card=>{
        const edit=card.querySelector("[data-edit-todo]");
        if(!edit)return;
        const item=state.todos[Number(edit.dataset.editTodo)];
        if(item&&!card.querySelector(".todo-card-progress"))card.querySelector(".todo-card-title")?.insertAdjacentHTML("afterend",cardProgressHtml(item));
        if(item?.location&&!card.querySelector(".todo-address-meta")){
          const detail=card.querySelector(".todo-card-meta:nth-of-type(3)")||card.querySelector(".todo-card-meta:last-of-type");
          detail?.insertAdjacentHTML("afterend",`<div class="todo-card-meta todo-address-meta">주소: ${esc(item.location)}</div>`);
        }
      });
      $$(".todo-list-row").forEach(row=>{
        const edit=row.querySelector("[data-edit-todo]");
        if(!edit)return;
        const item=state.todos[Number(edit.dataset.editTodo)];
        if(item?.location&&row.children[0]&&!row.querySelector(".todo-list-address")){
          row.children[0].insertAdjacentHTML("beforeend",`<div class="meta todo-list-address">주소: ${esc(item.location)}</div>`);
        }
      });
    }
    const renderDashboardWithAddress=renderDashboard;
    renderDashboard=function(){
      renderDashboardWithAddress();
      $$(".today-item").forEach(item=>{
        const todoIndex=item.dataset.editTodo,assignmentIndex=item.dataset.openAssignment;
        const data=todoIndex!==undefined?state.todos[Number(todoIndex)]:assignmentIndex!==undefined?state.assignments[Number(assignmentIndex)]:null;
        if(data?.location&&!item.querySelector(".today-address"))item.insertAdjacentHTML("beforeend",`<div class="meta today-address">주소: ${esc(data.location)}</div>`);
      });
    }
    if(currentView==="assignments"){resetAssignmentCalendarToToday();syncViewChrome()}
    if(currentView==="dashboard"){resetDashboardToToday();syncViewChrome()}
    (function setupGoogleDriveFiles(){
      const DRIVE_SCOPE="https://www.googleapis.com/auth/drive.file";
      const driveStoreKey="solar-google-drive-config-v1";
      const driveTokenState={client:null,token:"",expiresAt:0,query:"",folderId:"",folderName:"태양광 공무팀 프로젝트 파일",files:[]};
      const driveTypeMap={folder:"FOLDER","application/vnd.google-apps.folder":"FOLDER","text/markdown":"MD","text/plain":"TXT","text/html":"HTML","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"XLS","application/vnd.ms-excel":"XLS","application/pdf":"PDF","image/png":"IMG","image/jpeg":"IMG"};
      function driveConfig(){try{return JSON.parse(localStorage.getItem(driveStoreKey)||"{}")}catch{return{}}}
      function saveDriveConfig(cfg){localStorage.setItem(driveStoreKey,JSON.stringify({...driveConfig(),...cfg}))}
      function injectDriveChrome(){
        if(!$("#driveView")){
          els.adminView.insertAdjacentHTML("afterend",`<section class="panel hidden" id="driveView"></section>`);
          els.driveView=$("#driveView");
        }
        if(!$("#driveStyle")){
          document.head.insertAdjacentHTML("beforeend",`<style id="driveStyle">
            #driveView{box-shadow:none;background:transparent;border:0;padding:0}
            .drive-shell{display:grid;grid-template-columns:260px minmax(0,1fr);gap:14px;align-items:start}
            .drive-side,.drive-main,.drive-card{background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:14px}
            .drive-side{display:grid;gap:12px}.drive-main{min-width:0}
            .drive-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
            .drive-path{display:flex;gap:8px;align-items:center;color:var(--muted);font-size:13px;font-weight:850;margin-top:4px}
            .drive-file-list{border-top:1px solid var(--line);margin-top:12px}
            .drive-row{display:grid;grid-template-columns:54px minmax(0,1fr) 110px 150px 126px;gap:10px;align-items:center;min-height:58px;border-bottom:1px solid var(--line);padding:8px 0}
            .drive-row button{text-align:left}.drive-type{display:inline-grid;place-items:center;min-width:38px;height:24px;border-radius:6px;background:#edf3f5;color:#52636b;font-size:11px;font-weight:900}
            .drive-type.xls{background:#e8f5ed;color:#177245}.drive-type.folder{background:#fff2d9;color:#9a5b08}.drive-type.html{background:#edf0ff;color:#4056b2}.drive-type.img{background:#f7eafa;color:#7c3b89}
            .drive-name{font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.drive-empty{border:1px dashed var(--line);border-radius:8px;padding:28px;text-align:center;color:var(--muted);background:#fbfdfe;margin-top:12px}
            .drive-settings{display:grid;gap:8px}.drive-settings .field{width:100%}.drive-note{font-size:12px;line-height:1.55;color:var(--muted)}
            @media(max-width:900px){.drive-shell{grid-template-columns:1fr}.drive-row{grid-template-columns:44px minmax(0,1fr);gap:8px}.drive-row .meta,.drive-row .drive-actions{grid-column:2}.drive-row .drive-actions{justify-content:flex-start}}
          #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
        }
      }
      function ensureDriveNav(){
        if(!state.nav.some(n=>n.label==="프로젝트 파일")){
          const adminIndex=state.nav.findIndex(n=>n.label.includes("관리자"));
          state.nav.splice(adminIndex>=0?adminIndex:state.nav.length,0,{icon:"▤",label:"프로젝트 파일"});
        }
      }
      const baseNormalizeForDrive=normalizeState;
      normalizeState=function(){baseNormalizeForDrive();ensureDriveNav()};
      const baseViewForLabelForDrive=viewForLabel;
      viewForLabel=function(label){return label.includes("프로젝트 파일")||label.includes("Drive")?"drive":baseViewForLabelForDrive(label)};
      const baseIsActiveForDrive=isActive;
      isActive=function(label){return currentView==="drive"?label.includes("프로젝트 파일"):baseIsActiveForDrive(label)};
      const baseRenderViewForDrive=renderView;
      renderView=function(){
        injectDriveChrome();
        baseRenderViewForDrive();
        const isDrive=currentView==="drive";
        $("#kpis").classList.toggle("hidden",isDrive||currentView==="dashboard"||currentView==="assignments"||currentView==="todos");
        els.dashboardView.classList.toggle("hidden",currentView!=="dashboard");
        els.adminView.classList.toggle("hidden",currentView!=="admin");
        els.driveView.classList.toggle("hidden",!isDrive);
        els.mainGrid.classList.toggle("hidden",isDrive||currentView==="dashboard"||currentView==="admin");
        document.body.classList.toggle("drive-page",isDrive);
      };
      const baseRenderCurrentForDrive=renderCurrentContent;
      renderCurrentContent=function(){
        if(currentView==="drive"){syncViewChrome();renderDriveView();return}
        baseRenderCurrentForDrive();
      };
      const baseSyncViewChromeForDrive=syncViewChrome;
      syncViewChrome=function(){
        baseSyncViewChromeForDrive();
        if(currentView==="drive"){
          els.pageTitle.textContent="프로젝트 파일";
          els.pageSub.textContent="Google Drive에 프로젝트별 파일을 만들고 저장합니다.";
          $("#addProjectBtn").textContent="파일 업로드";
        }
      };
      const baseGoToViewForDrive=goToView;
      goToView=function(view,label=""){baseGoToViewForDrive(view,label);if(view==="drive"){syncViewChrome();renderDriveView();applyMasking()}};
      const originalAddProjectClick=document.addEventListener;
      function typeLabel(file){const key=file.mimeType==="application/vnd.google-apps.folder"?"folder":file.mimeType;return driveTypeMap[key]||((file.name||"").split(".").pop()||"FILE").slice(0,4).toUpperCase()}
      function typeClass(file){const t=typeLabel(file).toLowerCase();return t==="folder"?"folder":t==="xls"?"xls":t==="html"?"html":t==="img"?"img":""}
      function bytes(n){if(!n)return "-";const u=["B","KB","MB","GB"];let i=0,v=Number(n);while(v>=1024&&i<u.length-1){v/=1024;i++}return `${v.toFixed(i?1:0)} ${u[i]}`}
      function driveDate(v){return v?new Date(v).toLocaleString("ko-KR",{dateStyle:"short",timeStyle:"short"}):"-"}
      function renderDriveView(){
        injectDriveChrome();
        const cfg=driveConfig(),connected=!!driveTokenState.token&&Date.now()<driveTokenState.expiresAt;
        const files=driveTokenState.files.filter(f=>!driveTokenState.query||f.name.toLowerCase().includes(driveTokenState.query.toLowerCase()));
        els.driveView.innerHTML=`<div class="drive-shell">
          <aside class="drive-side">
            <div class="drive-card">
              <div class="panel-title"><h2>Google Drive</h2><span class="badge ${connected?"green":"amber"}">${connected?"연결됨":"설정 필요"}</span></div>
              <div class="drive-settings">
                <label class="label">OAuth Client ID</label>
                <input class="field" id="driveClientId" value="${esc(cfg.clientId||"")}" placeholder="Google Cloud OAuth Client ID">
                <label class="label">프로젝트 루트 폴더명</label>
                <input class="field" id="driveRootName" value="${esc(cfg.rootName||driveTokenState.folderName)}">
                <button class="btn primary" id="driveSaveConfigBtn">설정 저장</button>
                <button class="btn" id="driveConnectBtn">${connected?"다시 연결":"Google 계정 연결"}</button>
              </div>
              <p class="drive-note">처음에는 Google Cloud에서 Drive API 사용 설정과 OAuth 승인된 JavaScript 원본에 현재 GitHub Pages 주소를 추가해야 합니다.</p>
            </div>
            <div class="drive-card">
              <div class="label">현재 폴더</div>
              <div class="name" id="driveFolderName">${esc(driveTokenState.folderName)}</div>
              <div class="drive-actions" style="margin-top:10px">
                <button class="btn" id="driveCreateRootBtn">폴더 생성/열기</button>
                <button class="btn" id="driveRefreshBtn">새로고침</button>
              </div>
            </div>
          </aside>
          <section class="drive-main">
            <div class="panel-title">
              <div><h2>프로젝트 파일</h2><div class="drive-path">Google Drive · ${esc(driveTokenState.folderName)} · ${driveTokenState.files.length}개 항목</div></div>
              <div class="drive-actions">
                <input class="search" id="driveSearch" placeholder="파일명 검색" value="${esc(driveTokenState.query)}">
                <button class="btn" id="driveNewFolderBtn">폴더 생성</button>
                <label class="btn primary" for="driveUploadInput">파일 업로드</label>
                <input id="driveUploadInput" type="file" multiple hidden>
              </div>
            </div>
            <div class="drive-file-list">
              ${files.length?files.map(f=>`<div class="drive-row">
                <span class="drive-type ${typeClass(f)}">${esc(typeLabel(f))}</span>
                <button class="btn" data-drive-open="${esc(f.id)}"><span class="drive-name">${esc(f.name)}</span></button>
                <span class="meta">${bytes(f.size)}</span>
                <span class="meta">${driveDate(f.modifiedTime)}</span>
                <span class="drive-actions"><button class="btn icon" title="열기" data-drive-open="${esc(f.id)}">↗</button><button class="btn icon danger" title="삭제" data-drive-delete="${esc(f.id)}">×</button></span>
              </div>`).join(""):`<div class="drive-empty">Google Drive 폴더를 생성하거나 파일을 업로드하면 여기에 표시됩니다.</div>`}
            </div>
          </section>
        </div>`;
        $("#driveSearch")?.addEventListener("input",e=>{driveTokenState.query=e.target.value;renderDriveView()});
        $("#driveUploadInput")?.addEventListener("change",e=>uploadDriveFiles([...e.target.files]));
      }
      function loadScript(src){return new Promise((resolve,reject)=>{if([...document.scripts].some(s=>s.src===src))return resolve();const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
      async function ensureDriveToken(){
        const cfg=driveConfig();
        if(!cfg.clientId){toast("먼저 OAuth Client ID를 저장하세요.");return false}
        if(driveTokenState.token&&Date.now()<driveTokenState.expiresAt)return true;
        await loadScript("https://accounts.google.com/gsi/client");
        return new Promise(resolve=>{
          driveTokenState.client=google.accounts.oauth2.initTokenClient({client_id:cfg.clientId,scope:DRIVE_SCOPE,callback:r=>{
            if(r?.access_token){driveTokenState.token=r.access_token;driveTokenState.expiresAt=Date.now()+Math.max(300,Number(r.expires_in||3600)-60)*1000;toast("Google Drive에 연결했습니다.");resolve(true)}
            else resolve(false);
          }});
          driveTokenState.client.requestAccessToken({prompt:"consent"});
        });
      }
      async function driveFetch(url,options={}){
        if(!await ensureDriveToken())throw new Error("Drive token missing");
        const r=await fetch(url,{...options,headers:{Authorization:`Bearer ${driveTokenState.token}`,...(options.headers||{})}});
        if(!r.ok)throw new Error(`Drive API ${r.status}`);
        return r;
      }
      async function ensureRootFolder(){
        const cfg=driveConfig(),name=cfg.rootName||driveTokenState.folderName;
        driveTokenState.folderName=name;
        const q=encodeURIComponent(`name='${name.replaceAll("'","\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
        const found=await (await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime,size,mimeType,webViewLink)`)).json();
        if(found.files?.[0]){driveTokenState.folderId=found.files[0].id;return driveTokenState.folderId}
        const created=await (await driveFetch("https://www.googleapis.com/drive/v3/files?fields=id,name",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,mimeType:"application/vnd.google-apps.folder"})})).json();
        driveTokenState.folderId=created.id;return created.id;
      }
      async function refreshDriveFiles(){
        try{
          const folderId=await ensureRootFolder();
          const q=encodeURIComponent(`'${folderId}' in parents and trashed=false`);
          const data=await (await driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=folder,name&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)`)).json();
          driveTokenState.files=data.files||[];
          renderDriveView();
        }catch(err){toast("Drive 목록을 불러오지 못했습니다.");console.warn(err)}
      }
      async function createDriveFolder(){
        const name=prompt("생성할 폴더 이름",`프로젝트_${localDateString().replaceAll("-","")}`);
        if(!name)return;
        try{await ensureRootFolder();await driveFetch("https://www.googleapis.com/drive/v3/files",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,mimeType:"application/vnd.google-apps.folder",parents:[driveTokenState.folderId]})});toast("폴더를 생성했습니다.");refreshDriveFiles()}catch(err){toast("폴더 생성에 실패했습니다.");console.warn(err)}
      }
      async function uploadDriveFiles(files){
        if(!files.length)return;
        try{
          await ensureRootFolder();
          for(const file of files){
            const meta={name:file.name,parents:[driveTokenState.folderId]},boundary="drive-upload-"+Date.now();
            const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: ${file.type||"application/octet-stream"}\r\n\r\n`,file,`\r\n--${boundary}--`]);
            await driveFetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",{method:"POST",headers:{"Content-Type":`multipart/related; boundary=${boundary}`},body});
          }
          toast(`${files.length}개 파일을 업로드했습니다.`);refreshDriveFiles();
        }catch(err){toast("파일 업로드에 실패했습니다.");console.warn(err)}
      }
      document.addEventListener("click",e=>{
        const t=e.target.closest("button,[data-drive-open],[data-drive-delete],label")||e.target;
        if(currentView==="drive"&&t.id==="addProjectBtn"){e.preventDefault();e.stopImmediatePropagation();$("#driveUploadInput")?.click()}
        if(t.id==="driveSaveConfigBtn"){saveDriveConfig({clientId:$("#driveClientId").value.trim(),rootName:$("#driveRootName").value.trim()||driveTokenState.folderName});toast("Drive 설정을 저장했습니다.");renderDriveView()}
        if(t.id==="driveConnectBtn"){ensureDriveToken().then(ok=>ok&&refreshDriveFiles())}
        if(t.id==="driveCreateRootBtn"||t.id==="driveRefreshBtn"){refreshDriveFiles()}
        if(t.id==="driveNewFolderBtn"){createDriveFolder()}
        if(t.dataset.driveOpen){const f=driveTokenState.files.find(x=>x.id===t.dataset.driveOpen);if(f)window.open(f.webViewLink||`https://drive.google.com/open?id=${f.id}`,"_blank")}
        if(t.dataset.driveDelete){const f=driveTokenState.files.find(x=>x.id===t.dataset.driveDelete);if(f&&confirm(`${f.name} 파일을 휴지통으로 이동할까요?`)){driveFetch(`https://www.googleapis.com/drive/v3/files/${f.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({trashed:true})}).then(()=>{toast("파일을 휴지통으로 이동했습니다.");refreshDriveFiles()}).catch(()=>toast("삭제에 실패했습니다."))}}
      },true);
      injectDriveChrome();
      /* ── 보고서 IIFE에서 사용할 Drive API 노출 ── */
      window.driveApi={
        isConnected:()=>!!driveTokenState.token&&Date.now()<driveTokenState.expiresAt,
        ensureToken:ensureDriveToken,
        uploadFile:async function(name,blob){
          await ensureRootFolder();
          const folderId=driveTokenState.folderId;
          const boundary="dr-"+Date.now();
          const meta={name,parents:[folderId]};
          const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: ${blob.type}\r\n\r\n`,blob,`\r\n--${boundary}--`]);
          const r=await driveFetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",{method:"POST",headers:{"Content-Type":`multipart/related; boundary=${boundary}`},body});
          return r.json();
        }
      };
    })();
    (function setupDbCenter(){
      const dbStoreKey="solar-business-db-v1";
      let dbQuery="",dbSearchComposing=false,dbSearchTimer=null;
      function isUsefulDb(db){return db&&Array.isArray(db.rows)&&db.rows.length}
      function loadDb(){
        if(isUsefulDb(state.businessDb))return state.businessDb;
        try{
          const local=JSON.parse(localStorage.getItem(dbStoreKey)||"{}");
          const clearedAt=state.businessDbClearedAt?new Date(state.businessDbClearedAt).getTime():0;
          const localAt=new Date(local.cloudSavedAt||local.updatedAt||0).getTime();
          if(isUsefulDb(local)&&clearedAt&&(!localAt||localAt<=clearedAt)){
            localStorage.removeItem(dbStoreKey);
            return {};
          }
          if(isUsefulDb(local)){
            state.businessDb=local;
            state.businessDbSyncedAt=state.businessDbSyncedAt||new Date().toISOString();
            persistState();
          }
          return local;
        }catch{return{}}
      }
      function saveDb(data){
        const db={...data,cloudSavedAt:new Date().toISOString()};
        localStorage.setItem(dbStoreKey,JSON.stringify(db));
        state.businessDb=db;
        state.businessDbSyncedAt=db.cloudSavedAt;
        delete state.businessDbClearedAt;
        /* DB는 크기가 크므로 별도 Supabase 슬롯(id=db)에 즉시 직접 저장 */
        const h=supabaseHeaders({Prefer:"resolution=merge-duplicates,return=minimal"});
        fetch(`${SUPABASE_URL}/rest/v1/app_config`,{
          method:"POST",headers:h,
          body:JSON.stringify({id:"db",data:db,updated_at:db.cloudSavedAt})
        }).then(r=>{
          if(!r.ok)toast("⚠️ DB 공유 저장 실패 - 다시 시도해주세요");
        }).catch(()=>toast("⚠️ DB 공유 저장 실패 - 네트워크를 확인해주세요"));
        persistState();
      }
      function clearDb(){
        localStorage.removeItem(dbStoreKey);
        delete state.businessDb;
        state.businessDbSyncedAt=new Date().toISOString();
        state.businessDbClearedAt=state.businessDbSyncedAt;
        fetch(`${SUPABASE_URL}/rest/v1/app_config?id=eq.db`,{method:"DELETE",headers:supabaseHeaders()}).catch(()=>{});
        persistState();
      }
      function dbSavedText(db){
        if(!isUsefulDb(db))return "아직 공유 저장된 DB가 없습니다.";
        const when=db.cloudSavedAt||db.updatedAt||state.businessDbSyncedAt;
        const time=when?new Date(when).toLocaleString("ko-KR"):"시간 미확인";
        return `공유 저장됨 · ${time}`;
      }
      function dbRows(){const db=loadDb();return Array.isArray(db.rows)?db.rows:[]}
      function dbColumns(){const rows=dbRows();return rows[0]?Object.keys(rows[0]):[]}
      function dbCell(row,names){const keys=Object.keys(row||{});for(const name of names){const found=keys.find(k=>k.replace(/\s/g,"").toLowerCase()===String(name).replace(/\s/g,"").toLowerCase());if(found&&row[found]!==undefined&&row[found]!==null&&String(row[found]).trim()!=="")return String(row[found]).trim()}return""}
      function dbKw(row){const v=dbCell(row,["공사용량","발전허가용량","공사_용량","발전_허가용량","용량(kW)","용량","설비용량","kw","kW"]);return v?`${v}kW`:""}
      function dbSummary(row){return [dbCell(row,["발전소명","현장명","사업장명","발전소","상호"]),dbKw(row),dbCell(row,["사업주","사업주명","대표자","고객명","발주처","성명"]),dbCell(row,["현장 주소","주소","설치주소","현장주소","소재지"])].filter(Boolean).join(" · ")}
      function searchDb(q,limit=8){q=String(q||"").trim().toLowerCase();if(!q)return[];return dbRows().map((row,i)=>({row,i,text:Object.values(row).join(" ").toLowerCase()})).filter(x=>x.text.includes(q)).slice(0,limit)}
      window.solarDb={rows:dbRows,columns:dbColumns,search:searchDb,cell:dbCell,summary:dbSummary};
      function injectDbChrome(){
        if(!$("#dbView")){
          (els.reportView||els.driveView||els.adminView).insertAdjacentHTML("afterend",`<section class="panel hidden" id="dbView"></section>`);
          els.dbView=$("#dbView");
        }
        if(!$("#dbStyle")){
          document.head.insertAdjacentHTML("beforeend",`<style id="dbStyle">
            #dbView{box-shadow:none;background:transparent;border:0;padding:0}.db-shell{display:grid;grid-template-columns:330px minmax(0,1fr);gap:14px;align-items:start}
            .db-card,.db-main{background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:14px}.db-card{display:grid;gap:10px}
            .db-drop{border:2px dashed #b8c8cf;border-radius:8px;background:#fbfdfe;min-height:150px;display:grid;place-items:center;text-align:center;padding:18px;color:var(--muted);font-weight:850}
            .db-drop.dragover{border-color:var(--teal);background:#e8f8fa;color:var(--ink)}.db-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px}.db-stat{border:1px solid var(--line);border-radius:8px;padding:10px;background:#fbfdfe}
            .db-results{display:grid;gap:8px;margin-top:12px}.db-result{width:100%;border:1px solid var(--line);background:#fff;border-radius:8px;padding:10px;text-align:left}
            .db-preview{max-height:520px;overflow:auto;margin-top:12px}.db-preview table{min-width:900px}.report-db-results{display:grid;gap:6px;margin-top:6px}
            .report-db-result{width:100%;border:1px solid var(--line);background:#fbfdfe;border-radius:8px;padding:8px;text-align:left;font-size:12px}
            @media(max-width:960px){.db-shell{grid-template-columns:1fr}}
          #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
        }
      }
      function ensureDbNav(){
        if(!state.nav.some(n=>n.label==="DB")){
          const reportIndex=state.nav.findIndex(n=>n.label==="보고서");
          const adminIndex=state.nav.findIndex(n=>n.label.includes("관리자"));
          state.nav.splice(reportIndex>=0?reportIndex+1:(adminIndex>=0?adminIndex:state.nav.length),0,{icon:"▦",label:"DB"});
        }
      }
      const baseNormalizeForDb=normalizeState;
      normalizeState=function(){baseNormalizeForDb();ensureDbNav()};
      const baseViewForLabelForDb=viewForLabel;
      viewForLabel=function(label){return label.includes("DB")?"db":baseViewForLabelForDb(label)};
      const baseIsActiveForDb=isActive;
      isActive=function(label){return currentView==="db"?label.includes("DB"):baseIsActiveForDb(label)};
      const baseRenderViewForDb=renderView;
      renderView=function(){
        injectDbChrome();baseRenderViewForDb();
        const isDb=currentView==="db";
        els.dbView.classList.toggle("hidden",!isDb);
        document.body.classList.toggle("db-page",isDb);
        if(isDb){$("#kpis").classList.add("hidden");els.dashboardView.classList.add("hidden");els.adminView.classList.add("hidden");els.mainGrid.classList.add("hidden");if(els.driveView)els.driveView.classList.add("hidden");if(els.reportView)els.reportView.classList.add("hidden")}
      };
      const baseRenderCurrentForDb=renderCurrentContent;
      renderCurrentContent=function(){if(currentView==="db"){syncViewChrome();renderDbView();return}baseRenderCurrentForDb()};
      const baseSyncViewChromeForDb=syncViewChrome;
      syncViewChrome=function(){baseSyncViewChromeForDb();if(currentView==="db"){els.pageTitle.textContent="DB";els.pageSub.textContent="엑셀 DB 파일을 공유 저장하고 보고서/시공일정 자동입력에 사용합니다.";$("#addProjectBtn").textContent="DB 업로드"}};
      const baseGoToViewForDb=goToView;
      goToView=function(view,label=""){baseGoToViewForDb(view,label);if(view==="db"){syncViewChrome();renderDbView();applyMasking()}};
      let kiwoomDbTab="db",kiwoomStations=[],kiwoomQuery="",kiwoomLoaded=false,kiwoomSelectedRow=null,kiwoomSyncing=false;
      async function loadKiwoomStations(){
        if(kiwoomLoaded)return;
        try{
          const hdr={apikey:SUPABASE_ANON_KEY,Authorization:"Bearer "+SUPABASE_ANON_KEY};
          const meta=await(await fetch(SUPABASE_URL+"/rest/v1/app_state?id=eq.kiwoom_meta",{headers:hdr})).json();
          if(meta[0]&&meta[0].data&&meta[0].data.chunks){
            const n=meta[0].data.chunks;
            const ids=[];for(let i=0;i<n;i++)ids.push("kiwoom_sync_"+i);
            const results=await Promise.all(ids.map(id=>fetch(SUPABASE_URL+"/rest/v1/app_state?id=eq."+id,{headers:hdr}).then(r=>r.json())));
            kiwoomStations=[];
            results.forEach(r=>{if(r[0]&&r[0].data)kiwoomStations=kiwoomStations.concat(r[0].data);});
          } else {
            const j=await(await fetch(SUPABASE_URL+"/rest/v1/app_state?id=eq.kiwoom_sync",{headers:hdr})).json();
            kiwoomStations=(j[0]&&j[0].data)||[];
          }
          kiwoomLoaded=true;
        }catch(e){}
      }
      async function syncPmsStations(){
        if(kiwoomSyncing)return;
        kiwoomSyncing=true;
        renderDbView();
        try{
          const res=await fetch("https://kiwoom45.com/all-stations",{credentials:"include",headers:{"Accept":"application/json, text/html, */*","Cache-Control":"no-cache"}});
          if(!res.ok)throw new Error("status "+res.status);
          let data;
          const ct=res.headers.get("content-type")||"";
          if(ct.includes("json")){data=await res.json();}
          else{
            const html=await res.text();
            const m=html.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if(m)data=JSON.parse(m[0]);else throw new Error("JSON 파싱 실패");
          }
          const stations=Array.isArray(data)?data:(data.data||data.stations||data.rows||data.list||data.plants||[]);
          if(!stations.length)throw new Error("데이터 없음");
          const hdr={apikey:SUPABASE_ANON_KEY,Authorization:"Bearer "+SUPABASE_ANON_KEY,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates"};
          const CHUNK=400;
          const chunks=[];
          for(let i=0;i<stations.length;i+=CHUNK)chunks.push(stations.slice(i,i+CHUNK));
          await Promise.all(chunks.map((ch,i)=>fetch(SUPABASE_URL+"/rest/v1/app_state",{method:"POST",headers:hdr,body:JSON.stringify({id:"kiwoom_sync_"+i,data:ch})})
          ));
          await fetch(SUPABASE_URL+"/rest/v1/app_state",{method:"POST",headers:hdr,body:JSON.stringify({id:"kiwoom_meta",data:{chunks:chunks.length,total:stations.length,syncedAt:new Date().toISOString()}})});
          kiwoomStations=stations;
          kiwoomLoaded=true;
          toast(`발전소 ${stations.length}건 동기화 완료`);
        }catch(e){
          toast("동기화 실패: "+e.message+" — kiwoom45.com에 로그인된 상태인지 확인하세요.");
        }finally{
          kiwoomSyncing=false;
          renderDbView();
        }
      }
      function renderKiwoomDetail(s){
        if(!s)return "";
        const keys=Object.keys(s);
        let rows="";
        keys.forEach(k=>{const v=s[k]!=null?String(s[k]):"";if(v)rows+=`<tr><td style="padding:5px 8px;border:1px solid #e2e8f0;background:#f8fafc;white-space:nowrap;font-weight:600;color:#475569;font-size:11px">${esc(k)}</td><td style="padding:5px 8px;border:1px solid #e2e8f0;font-size:12px">${esc(v)}</td></tr>`;});
        return `<div style="margin-top:12px;border:2px solid var(--teal);border-radius:8px;overflow:hidden"><div style="background:var(--teal);color:#fff;padding:8px 12px;font-weight:bold;font-size:13px">${esc(s["발전소명"]||s["site"]||"")} 상세정보 (${keys.length}개 항목)</div><div style="overflow-y:auto;max-height:400px"><table style="width:100%;border-collapse:collapse"><tbody>${rows}</tbody></table></div></div>`;
      }
      function renderKiwoomTab(){
        const q=kiwoomQuery.toLowerCase().trim();
        const filtered=q?kiwoomStations.filter(s=>Object.values(s).join(" ").toLowerCase().includes(q)):kiwoomStations;
        const fixedCols=["영업순번","계약법인","발전소명","공사용량","영업담당자","연락처","현장주소","진행상태","건립종류"];
        const shown=filtered.slice(0,300);
        let ths="",rows="";
        fixedCols.forEach(c=>{ths+=`<th style="padding:8px;border:1px solid #e2e8f0;background:#f1f5f9;white-space:nowrap">${esc(c)}</th>`;});
        shown.forEach((s,i)=>{
          const sel=kiwoomSelectedRow===i;
          rows+=`<tr style="cursor:pointer;background:${sel?"#ecfdf5":""}" data-kidx="${i}" class="kiwoom-row">`;
          fixedCols.forEach(c=>{const v=s[c]!=null?String(s[c]):"";rows+=`<td style="padding:7px 8px;border:1px solid #e2e8f0;white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis">${esc(v)}</td>`;});
          rows+="</tr>";
        });
        const syncedAt=kiwoomStations._syncedAt||"";
        const detailHtml=kiwoomSelectedRow!=null?renderKiwoomDetail(filtered[kiwoomSelectedRow]):`<div style="color:#94a3b8;font-size:12px;margin-top:8px;padding:8px">행을 클릭하면 전체 컬럼 상세정보가 표시됩니다.</div>`;
        return `<div style="padding:16px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><input class="search" id="kiwoomSearchInput" placeholder="발전소명, 사업주, 주소, 담당자 등 검색" value="${esc(kiwoomQuery)}" style="flex:1"><button class="btn${kiwoomSyncing?" disabled":""}" id="kiwoomSyncBtn" ${kiwoomSyncing?"disabled":""}>${kiwoomSyncing?"⏳ 동기화 중...":"↻ 업데이트"}</button><span class="badge ${kiwoomStations.length?"green":"amber"}">${kiwoomStations.length}개</span></div><div class="meta" style="margin-bottom:10px">검색결과 ${filtered.length}건${filtered.length>300?" (300건 표시)":""}${syncedAt?" · 저장됨":""}</div><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>${ths}</tr></thead><tbody id="kiwoomTbody">${rows}</tbody></table></div>${detailHtml}</div>`;
      }
      function renderDbView(){
        injectDbChrome();
        const tabHtml=`<div style="display:flex;gap:8px;margin-bottom:12px"><button class="btn${kiwoomDbTab==="db"?" primary":""}" id="dbTabBtn">📁 DB 파일</button><button class="btn${kiwoomDbTab==="kiwoom"?" primary":""}" id="kiwoomTabBtn">☀ 발전소 현황${kiwoomStations.length?" ("+kiwoomStations.length+")":""}</button></div>`;
        if(kiwoomDbTab==="kiwoom"){
          els.dbView.innerHTML="<div>"+tabHtml+renderKiwoomTab()+"</div>";
          $("#dbTabBtn")?.addEventListener("click",()=>{kiwoomDbTab="db";renderDbView();});
          const si=$("#kiwoomSearchInput");
          if(si){
            let _comp=false;
            si.addEventListener("compositionstart",()=>{_comp=true;});
            si.addEventListener("compositionend",e=>{_comp=false;kiwoomQuery=e.target.value;renderDbView();});
            si.addEventListener("input",e=>{if(!_comp){kiwoomQuery=e.target.value;renderDbView();}});
          }
          $("#kiwoomSyncBtn")?.addEventListener("click",()=>syncPmsStations());
          $("#kiwoomTbody")?.addEventListener("click",e=>{const tr=e.target.closest(".kiwoom-row");if(tr){const idx=parseInt(tr.dataset.kidx);const q=kiwoomQuery.toLowerCase().trim();const filtered=q?kiwoomStations.filter(s=>Object.values(s).join(" ").toLowerCase().includes(q)):kiwoomStations;kiwoomSelectedRow=(kiwoomSelectedRow===idx)?null:idx;renderDbView();}});
          return;
        }
        const db=loadDb(),rows=dbRows(),cols=dbColumns(),results=searchDb(dbQuery,12);
        const hasQuery=!!dbQuery.trim(),previewRows=hasQuery?results.map(x=>x.row):rows.slice(0,200),showing=hasQuery?results.length:Math.min(rows.length,200);
        els.dbView.innerHTML=tabHtml+`<div class="db-shell">
          <aside class="db-card">
            <div class="panel-title"><h2>DB 파일</h2><span class="badge ${rows.length?"green":"amber"}">${rows.length?`${rows.length}건`:"비어 있음"}</span></div>
            <label class="db-drop" id="dbDropZone">엑셀(.xlsx) 또는 CSV 파일을<br>여기에 드래그하거나 클릭해서 업로드하세요.<input id="dbFileInput" type="file" accept=".xlsx,.xls,.csv" hidden></label>
            <div class="db-stats"><div class="db-stat"><div class="label">파일명</div><strong>${esc(db.fileName||"-")}</strong></div><div class="db-stat"><div class="label">열 개수</div><strong>${cols.length}</strong></div></div>
            <button class="btn danger" id="dbClearBtn">DB 비우기</button>
            <p class="meta">${esc(dbSavedText(db))}<br>업로드한 DB는 공유 저장되어 집, 회사, 모바일에서 같은 자료를 사용합니다.</p>
          </aside>
          <section class="db-main">
            <div class="panel-title"><h2>DB 검색</h2><input class="search" id="dbSearchInput" placeholder="발전소명, 사업주명, 주소 검색" value="${esc(dbQuery)}"></div>
            <div class="meta">전체 저장 ${rows.length}건 · ${hasQuery?`검색 결과 ${results.length}건`:`현재 미리보기 ${showing}건`}${!hasQuery&&rows.length>showing?` · 나머지는 검색으로 확인`:""} · ${esc(dbSavedText(db))}</div>
            <div class="db-results">${results.length?results.map(x=>`<button class="db-result" data-db-result="${x.i}"><strong>${esc(dbSummary(x.row)||"이름 없는 항목")}</strong><div class="meta">${esc(Object.entries(x.row).slice(0,5).map(([k,v])=>`${k}: ${v}`).join(" · "))}</div></button>`).join(""):`<div class="meta">${rows.length?"검색어를 입력하세요.":"먼저 DB 엑셀 파일을 업로드하세요."}</div>`}</div>
            <div class="db-preview">${rows.length?`<table><thead><tr>${cols.slice(0,10).map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${previewRows.map(r=>`<tr>${cols.slice(0,10).map(c=>`<td>${esc(r[c]??"")}</td>`).join("")}</tr>`).join("")}</tbody></table>`:""}</div>
          </section>
        </div>`;
        $("#kiwoomTabBtn")?.addEventListener("click",()=>{kiwoomDbTab="kiwoom";loadKiwoomStations().then(()=>renderDbView());});
        const dbInput=$("#dbSearchInput");
        function refreshDbSearchInput(){
          renderDbView();
          const next=$("#dbSearchInput");
          if(next){next.focus();next.setSelectionRange(next.value.length,next.value.length)}
        }
        function scheduleDbSearchRefresh(){
          clearTimeout(dbSearchTimer);
          dbSearchTimer=setTimeout(refreshDbSearchInput,260);
        }
        dbInput?.addEventListener("compositionstart",()=>{dbSearchComposing=true});
        dbInput?.addEventListener("compositionend",e=>{dbSearchComposing=false;dbQuery=e.target.value;scheduleDbSearchRefresh()});
        dbInput?.addEventListener("input",e=>{dbQuery=e.target.value;if(!dbSearchComposing)scheduleDbSearchRefresh()});
        $("#dbFileInput")?.addEventListener("change",e=>parseDbFile(e.target.files[0]));
      }
      function loadXlsxScript(){return new Promise((resolve,reject)=>{if(window.XLSX)return resolve();const src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";if([...document.scripts].some(s=>s.src===src)){const wait=()=>window.XLSX?resolve():setTimeout(wait,100);return wait()}const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
      function compactDbRow(row){
        const get=names=>dbCell(row,names);
        return {
          영업순번:get(["영업순번"]),
          계약법인:get(["계약법인"]),
          발전소명:get(["발전소명","현장명","사업장명","발전소"]),
          건립종류:get(["건립종류","지붕유형","지붕형태","설치유형"]),
          영업담당자:get(["영업 담당자","영업담당자","담당자"]),
          사업주:get(["사업주","사업주명","대표자","고객명","성명"]),
          연락처:get(["연락처","전화번호","휴대폰","핸드폰","사업주연락처"]),
          현장주소:get(["현장 주소","현장주소","주소","설치주소","소재지"]),
          진행상태:get(["진행중","상태","공사진행"]),
          고객요청사항:get(["고객요청사항","요청사항","비고"]),
          발전허가용량:get(["발전_허가용량","허가용량"]),
          공사용량:get(["공사_용량","공사계획_허가용량","용량","용량(kW)","설비용량"]),
          모듈종류:get(["모듈종류/등급","모듈종류"]),
          모듈용량:get(["모듈용량"]),
          모듈장수:get(["모듈장수"]),
          구조물업체:get(["구조물_생산업체","구조물업체"]),
          시공업체:get(["시공_전기시공업체","전기시공업체","시공사"]),
          구조물시공팀:get(["시공_구조물시공팀","구조물시공팀"]),
          구조물시작일:get(["시공_구조물시작일"]),
          구조물종료일:get(["시공_구조물종료일"]),
          전기시공시작일:get(["시공_전기시공시작일"]),
          상업운전개시일:get(["한전_상업운전개시일"]),
          AS원인:get(["A/S원인"]),
          AS분류:get(["A/S분류"]),
          AS처리여부:get(["A/S처리여부"]),
          AS완료일자:get(["A/S완료일자","A/S완료일1차","A/S완료일2차","A/S완료일3차"]),
          계약일:get(["계약일"]),
          공사금액공급가:get(["공사금액(공급가)","공사금액공급가"]),
          재무신규공급가:get(["재무_신규공급가","신규공급가"]),
          재무상품서비스금액:get(["재무_상품/서비스금액","상품/서비스금액"]),
          계약금:get(["계약금"]),
          잔금1:get(["잔금1"]),
          잔금2:get(["잔금2"]),
          잔금3:get(["잔금3"]),
          잔금4:get(["잔금4"]),
          잔금5:get(["잔금5"]),
          키움수금액:get(["키움_수금액","수금액"]),
          재무미수잔액:get(["재무_미수잔액","미수잔액"]),
          발주모듈금액:get(["발주_모듈금액","모듈금액"]),
          발주인버터금액:get(["발주_인버터금액","인버터금액"]),
          발주분전함금액:get(["발주_분전함금액","분전함금액"]),
          발주구조물금액:get(["발주_구조물금액","구조물금액"]),
          구조물시공비:get(["구조물시공비"]),
          전기시공금액:get(["전기시공금액"]),
          보강비:get(["보강비","보강_합계금액"]),
          전기설계감리비:get(["전기설계감리비"]),
          모니터링설치비:get(["모니터링설치비"]),
          사용전검사비:get(["사용전검사_검사비"]),
          실측장비대:get(["실측_장비대"]),
          장비대지게차금액:get(["장비대_지게차금액"]),
          장비대크레인금액:get(["장비대_크레인금액"]),
          구조검토비1:get(["구조_검토비1"]),
          구조검토비2:get(["구조_검토비2"]),
          구조검토비3:get(["구조_검토비3"]),
          모듈선금액:get(["모듈 선금액"]),
          모듈잔금액:get(["모듈 잔금액"]),
          인버터선금액:get(["인버터 선금액"]),
          인버터잔금액:get(["인버터 잔금액"]),
          키움강판:get(["키움_강판"]),
          키움철강:get(["키움_철강"]),
          키움장비료:get(["키움_장비료"]),
          키움인건비:get(["키움_인건비"]),
          키움잡자재비:get(["키움_잡자재비"]),
          계약수수료:get(["계약수수료"]),
          완납수수료:get(["완납수수료"]),
          지사수수료1:get(["지사수수료1"]),
          지사수수료2:get(["지사수수료2"]),
          산하수수료:get(["산하수수료"]),
          발전허가일:get(["발전_허가일"]),
          개발허가일:get(["개발_허가일"]),
          PPA접수증수령일:get(["PPA_접수증수령일"]),
          구조물생산완료일:get(["구조물_생산완료일"]),
          공사계획허가일:get(["공사계획_허가일"]),
          사용전검사일:get(["사용전검사_검사일"]),
          설비완료일자:get(["설비_완료일자"]),
          PPA선로확보여부:get(["PPA_선로확보여부"]),
          검사합격여부:get(["검사_합격여부"]),
          발전완료:get(["발전_완료"]),
          개발완료:get(["개발_완료"]),
          PPA완료:get(["PPA_완료"]),
          구조물완료:get(["구조물_완료"]),
          구조물입고완료:get(["구조물입고_완료"]),
          행정사업개시완료:get(["행정_사업개시완료"]),
          행정준공완료:get(["행정_준공완료"]),
          설비등록완료:get(["설비등록_완료"]),
          수급계약완료:get(["수급계약_완료"])
        };
      }
      async function parseDbFile(file){
        if(!file)return;
        try{
          await loadXlsxScript();
          const buf=await file.arrayBuffer();
          const wb=XLSX.read(buf,{type:"array",cellDates:false});
          const ws=wb.Sheets[wb.SheetNames[0]];
          const rawRows=XLSX.utils.sheet_to_json(ws,{defval:""}).map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[String(k).trim(),String(v).trim()])));
          const rows=rawRows.map(compactDbRow).filter(r=>r.발전소명||r.사업주||r.현장주소);
          saveDb({fileName:file.name,updatedAt:new Date().toISOString(),sourceRows:rawRows.length,sourceColumns:Object.keys(rawRows[0]||{}).length,rows});
          window.solarDb={rows:dbRows,columns:dbColumns,search:searchDb,cell:dbCell,summary:dbSummary};
          toast(`DB ${rows.length}건을 공유 저장했습니다.`);renderDbView();
        }catch(err){toast("DB 파일을 읽지 못했습니다.");console.warn(err)}
      }
      document.addEventListener("click",e=>{const t=e.target.closest("button,label")||e.target;if(currentView==="db"&&t.id==="addProjectBtn"){e.preventDefault();e.stopImmediatePropagation();$("#dbFileInput")?.click()}if(t.id==="dbDropZone")$("#dbFileInput")?.click();if(t.id==="dbClearBtn"&&confirm("공유 저장된 DB를 비울까요? 모든 기기에서 DB가 비어 보입니다.")){clearDb();toast("공유 DB를 비웠습니다.");renderDbView()}},true);
      document.addEventListener("dragover",e=>{const z=e.target.closest?.("#dbDropZone");if(!z)return;e.preventDefault();z.classList.add("dragover")},true);
      document.addEventListener("dragleave",e=>{const z=e.target.closest?.("#dbDropZone");if(z)z.classList.remove("dragover")},true);
      document.addEventListener("drop",e=>{const z=e.target.closest?.("#dbDropZone");if(!z)return;e.preventDefault();z.classList.remove("dragover");parseDbFile(e.dataTransfer.files[0])},true);
      if(localStorage.getItem(viewStorageKey)==="db")currentView="db";
      injectDbChrome();
    })();
    (function setupReports(){
      const reportTabs=["A/S","시공월별보고서","기타","시공검수"];
      let reportTab="A/S",beforePhotos=[],afterPhotos=[],genericPhotos=[];
      const inspDraftKey="solar-inspection-draft-v1";
      const INSP_CHECKLIST=[
        {cat:"안전",sub:"안전장비",items:["안전모·안전화·안전장갑·안전벨트 착용 확인","안전펜스·안전와이어·안전망 설치 확인","안전사다리·승주방지판 설치 확인"]},
        {cat:"구조물",sub:"배치",items:["용마루 - 베이스 간격 확인","처마끝 - 베이스 간격 확인","베이스-베이스 전후 간격 확인","베이스-베이스 좌우 간격 확인","모듈-모듈 간격 확인","음영발생·높이 단차 확인"]},
        {cat:"구조물",sub:"구조물",items:["시공 구조물 - 도면 배치 동일 유무 확인","시공 모듈 - 도면 배치 동일 유무 확인","시공된 T볼트 - 도면과 위치 일치 유무 확인","시공된 T볼트 체결 상태 확인","베이스·T볼트·스크류볼트 실리콘 마감 상태 확인","손상 구조물·가공 치수 불일치 확인","클램프류 체결 상태 확인","양끝 모듈 100mm 이격 거리 확인","X 브레이싱 설치 및 마감 확인","안전와이어 설치 확인","빔캡·레일 앤드캡 부착 여부 확인","발전소별 호기구분 표시 확인 (락카·매직 등)","구조물 설치 후 마감 상태 확인"]},
        {cat:"전기",sub:"모듈",items:["파손 모듈 여부 확인","모듈-구조물 접지 연결 상태 확인"]},
        {cat:"전기",sub:"인버터",items:["전기실 구조물·지붕 설치 확인","인버터 고정상태 확인 (유격·흔들림)","인버터 상하·좌우 간격 확인","모듈 어레이 구성·스트링 확인","인버터 손상 부위 및 소음 확인","배선 손상 확인","접속단자 (AC/DC) 체결 확인"]},
        {cat:"전기",sub:"배전반",items:["배전반 고정상태 확인 (유격·흔들림)","차단기 설치 상태 확인","배선 결선 및 손상 확인"]},
        {cat:"한전시공",sub:"외부",items:["전주·변압기 설치 확인","외선·내선·인입·COS 시공 상태 확인"]},
        {cat:"마감",sub:"청소상태",items:["지붕 위·물받이 내부·작업 반경내 청소 확인","홈통 쓰레기·쇳가루 제거 확인"]}
      ];
      const asDraftKey="solar-as-report-draft-v1",asFieldIds=["asNo","asReceived","asCompleted","asPhone","asSite","asClient","asAddress","asKw","asRoof","asBuilt","asDefectType","asDefectArea","asSymptom","asCause","asAction","asMaterial","asFinish","asCustomerCheck","asNotice"],genericDraftKey="solar-generic-report-draft-v1",genericFieldIds=["genericTitle","genericDate","genericReporter","genericDept","genericCategory","genericSite","genericTarget","genericSummary","genericBackground","genericIssue","genericAction","genericResult","genericRequest","genericNext","genericMemo"];
      function injectReportChrome(){
        if(!$("#reportView")){
          (els.driveView||els.adminView).insertAdjacentHTML("afterend",`<section class="panel hidden" id="reportView"></section>`);
          els.reportView=$("#reportView");
        }
        if(!$("#reportStyle")){
          document.head.insertAdjacentHTML("beforeend",`<style id="reportStyle">
            #reportView{box-shadow:none;background:transparent;border:0;padding:0}
            .report-shell{display:grid;grid-template-columns:minmax(360px,460px) minmax(0,1fr);gap:24px;align-items:start}
            .report-form,.report-card{background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:14px}
            .report-preview{background:transparent;border:0;box-shadow:none;padding:0;overflow:auto}
            .report-form{display:grid;gap:10px}.report-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
            .report-tabs button{min-height:36px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:0 14px;font-weight:900}
            .report-tabs button.active{background:var(--teal);border-color:var(--teal);color:#fff}
            .report-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.report-form-grid .full{grid-column:1/-1}.report-form-grid .field{width:100%;min-width:0}
            .report-photo-board{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px}
            .report-photo-board.dragging .report-drop-zone{border-color:var(--teal);background:#f2fbfc}
            .report-drop-zone{position:relative;min-height:176px;border:2px dashed #b8c8cf;border-radius:8px;background:linear-gradient(180deg,#fbfdfe,#f3f8fa);display:grid;align-content:center;justify-items:center;gap:10px;padding:18px;text-align:center;color:#25343b;font-weight:900;transition:.15s}
            .report-drop-zone:before{content:"+";width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--teal);color:#fff;font-size:26px;line-height:1}
            .report-drop-zone.dragover{border-color:var(--teal);background:#e8f8fa;transform:translateY(-1px)}
            .report-drop-title{font-size:15px}.report-drop-hint{font-size:12px;color:var(--muted);font-weight:700;line-height:1.45}
            .report-drop-count{display:inline-flex;align-items:center;justify-content:center;min-height:24px;border-radius:999px;background:#e8eef1;color:#52636b;padding:0 9px;font-size:12px;font-weight:900}
            .report-drop-zone{cursor:pointer}.report-drop-zone:active{transform:translateY(1px);box-shadow:inset 0 2px 8px rgba(0,0,0,.08)}
            .report-printing{transform:translateY(1px);box-shadow:inset 0 2px 7px rgba(0,0,0,.18)!important}
            .as-sheet{width:794px;max-width:100%;margin:0 auto;background:#fff;color:#111;font-family:"Malgun Gothic","Noto Sans KR",Arial,sans-serif;border:1px solid #ddd}
            .as-sheet h2{text-align:center;font-size:22px;margin:18px 0 20px}.as-section-title{font-weight:900;border-top:1px solid #999;border-bottom:1px solid #d8d8d8;padding:7px 12px;background:#fff}
            .as-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:13px}.as-table th,.as-table td{border-bottom:1px solid #d8d8d8;border-right:1px solid #d8d8d8;padding:5px 8px;white-space:normal;overflow:visible;text-overflow:clip;height:24px}
            .as-table th{width:96px;text-align:center;background:#fff;font-weight:900;color:#111}.as-table td:last-child,.as-table th:last-child{border-right:0}
            .as-photo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid #d8d8d8}.as-photo-cell{border-right:1px solid #d8d8d8;border-bottom:1px solid #d8d8d8;min-height:90px;display:grid;grid-template-rows:22px 1fr}.as-photo-cell:nth-child(3n){border-right:0}
            .as-photo-label{text-align:center;font-weight:900;font-size:12px;padding-top:3px}.as-photo-cell img{width:100%;height:80px;object-fit:cover;display:block}.as-photo-empty{display:grid;place-items:center;color:#999;font-size:11px;background:#f8f8f8;min-height:68px}
            .as-sign-row{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #d8d8d8}.as-sign-row>div{height:44px;border-right:1px solid #d8d8d8;text-align:center;font-weight:900;padding-top:6px;font-size:12px}.as-sign-row>div:last-child{border-right:0}
            .monthly-report-shell{display:grid;grid-template-columns:380px minmax(0,1fr);gap:22px;align-items:start}.monthly-report-controls{display:grid;gap:10px;width:100%;max-width:380px;overflow:hidden}.monthly-rate-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;width:100%}.monthly-a4{width:794px;max-width:100%;margin:0 auto;background:#fff;color:#111;border:1px solid #ddd;padding:20px 26px;font-family:"Malgun Gothic","Noto Sans KR",Arial,sans-serif}.monthly-a4 h2{text-align:center;margin:0 0 4px;font-size:21px}.monthly-a4 .subtitle{text-align:center;color:#333;font-size:12px;margin-bottom:10px}.monthly-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}.monthly-kpi{border:1px solid #d8d8d8;padding:7px;text-align:center}.monthly-kpi strong{display:block;font-size:16px}.monthly-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11.5px;margin-top:8px}.monthly-table th,.monthly-table td{border:1px solid #cfd8dc;padding:4px 5px;text-align:right;vertical-align:middle}.monthly-table th{background:#f1f6f8;text-align:center;font-weight:900}.monthly-table td:first-child,.monthly-table td:nth-child(2){text-align:left}.monthly-note{margin-top:8px;border:1px solid #d8d8d8;padding:7px;font-size:11.5px;line-height:1.5}.monthly-stamp{margin-top:10px;text-align:right;font-size:12px;font-weight:900}.monthly-detail{font-size:11px;color:#444;line-height:1.45}.monthly-empty{text-align:center;color:#555;padding:22px!important}.clean-monthly{padding:18px 24px}.monthly-title-block{border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:10px}.clean-monthly h2{font-size:22px}.monthly-kpi.profit{background:#f6fffb;border-color:#a9d8c0}.monthly-kpi em{display:block;margin-top:3px;font-style:normal;font-size:11px;color:#17834d;font-weight:900}.monthly-table.summary th,.monthly-table.summary td{font-size:12px}.monthly-table.cost td:nth-child(4),.monthly-table.detail td:nth-child(2){text-align:left}.monthly-profit{color:#118447}.monthly-loss{color:#c0392b}.monthly-input{display:grid;gap:5px;min-width:0}.monthly-input span{font-size:12px;font-weight:900;color:#34444b;white-space:normal;line-height:1.3}.monthly-input .field{width:100%;min-width:0;box-sizing:border-box}.monthly-input small{font-size:11px;line-height:1.35;color:var(--muted);min-height:30px}.monthly-rate-grid.single{grid-template-columns:minmax(0,1fr)}.monthly-rate-summary{display:grid;gap:4px;border:1px solid #d7e7df;background:#f7fffb;border-radius:8px;padding:10px;font-size:13px}.monthly-rate-summary span{color:#118447;font-weight:900}.clean-monthly .monthly-table th,.clean-monthly .monthly-table td{line-height:1.35;white-space:normal;word-break:keep-all}.clean-monthly .monthly-table.summary td:nth-child(n+3),.clean-monthly .monthly-table.summary th:nth-child(n+3){text-align:right;white-space:nowrap}.clean-monthly .monthly-table.cost td:nth-child(2),.clean-monthly .monthly-table.cost td:nth-child(3){text-align:right;white-space:nowrap}.clean-monthly .monthly-table.detail td:nth-child(3),.clean-monthly .monthly-table.detail td:nth-child(4),.clean-monthly .monthly-table.detail td:nth-child(5){text-align:right;white-space:nowrap}.clean-monthly .monthly-table.detail td:nth-child(2){max-width:0;overflow:hidden;text-overflow:ellipsis}
            .report-placeholder{min-height:340px;display:grid;place-items:center;text-align:center;color:var(--muted);line-height:1.7}.generic-sheet{width:794px;max-width:100%;margin:0 auto;background:#fff;color:#111;border:1px solid #ddd;padding:20px 26px;font-family:"Malgun Gothic","Noto Sans KR",Arial,sans-serif}.generic-sheet h2{text-align:center;margin:0 0 4px;font-size:21px}.generic-subtitle{text-align:center;color:#333;font-size:12px;margin-bottom:10px}.generic-section-title{margin-top:8px;border-top:2px solid #222;border-bottom:1px solid #ccd6da;background:#f6f9fa;padding:5px 9px;font-weight:900;font-size:13px}.generic-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:13px}.generic-table th,.generic-table td{border:1px solid #cfd8dc;padding:6px 8px;vertical-align:top;white-space:pre-wrap;word-break:keep-all;line-height:1.45}.generic-table th{width:108px;background:#f1f6f8;text-align:center;font-weight:900}.generic-photo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px}.generic-photo-grid img{width:100%;height:205px;object-fit:cover;border:1px solid #cfd8dc}.generic-photo-caption{text-align:center;font-size:12px;color:#333;margin-top:3px}.generic-photo-drop{border:2px dashed #b8c8cf;border-radius:8px;background:#fbfdfe;min-height:116px;display:grid;place-items:center;text-align:center;color:var(--muted);font-weight:900;padding:12px;cursor:pointer}.generic-photo-drop.dragover{border-color:var(--teal);background:#e8f8fa;color:var(--ink)}.generic-report-form .report-form-grid{grid-template-columns:1fr 1fr}.generic-report-form textarea.field{min-height:86px}.generic-report-form .wide-textarea{min-height:120px}
            body.report-page #sharedNotice{display:none!important}
            @media(max-width:1050px){.report-shell,.monthly-report-shell{grid-template-columns:1fr}.as-sheet,.monthly-a4{width:100%}}
            /* ── 집중 모드 ── */
            body.report-focus-mode>aside,body.report-focus-mode>header{display:none!important}
            body.report-focus-mode>main{padding:0!important;margin:0!important;max-width:none!important}
            body.report-focus-mode #reportView{padding:0!important}
            body.report-focus-mode .report-tabs,body.report-focus-mode .report-shell>aside,body.report-focus-mode .monthly-report-shell>aside{display:none!important}
            body.report-focus-mode .report-shell,body.report-focus-mode .monthly-report-shell{display:block!important;padding:8px!important}
            body.report-focus-mode .report-preview{overflow:visible!important}
            body.report-focus-mode .as-sheet,body.report-focus-mode .monthly-a4,body.report-focus-mode .generic-sheet{width:100%!important;border:0!important;box-shadow:none!important}
            .report-focus-bar{display:none;position:fixed;top:0;left:0;right:0;z-index:9999;background:#111;color:#fff;padding:6px 12px;font-size:13px;font-weight:900;align-items:center;gap:10px}
            body.report-focus-mode .report-focus-bar{display:flex!important}
            .report-focus-exit{background:rgba(255,255,255,.15);border:0;color:#fff;border-radius:6px;padding:4px 12px;font-weight:900;cursor:pointer;font-size:13px}
            .report-toolbar-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
            .report-drive-btn{display:inline-flex;align-items:center;gap:5px;padding:0 12px;height:32px;border:1px solid #4285f4;background:#fff;color:#4285f4;border-radius:6px;font-weight:900;font-size:13px;cursor:pointer;white-space:nowrap}
            .report-drive-btn:hover{background:#e8f0fe}
            .report-drive-save-btn{display:inline-flex;align-items:center;gap:5px;padding:0 12px;height:32px;border:1px solid #0f9d58;background:#fff;color:#0f9d58;border-radius:6px;font-weight:900;font-size:13px;cursor:pointer;white-space:nowrap}
            .report-drive-save-btn:hover{background:#e6f4ea}
            .report-focus-btn{display:inline-flex;align-items:center;gap:5px;padding:0 12px;height:32px;border:1px solid #333;background:#fff;color:#333;border-radius:6px;font-weight:900;font-size:13px;cursor:pointer;white-space:nowrap}
            .report-focus-btn:hover{background:#f5f5f5}
            .insp-wrap{max-width:700px;margin:0 auto;display:grid;gap:16px}
            .insp-header-card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:16px;display:grid;gap:10px}
            .insp-header-card h3{margin:0 0 4px;font-size:15px;font-weight:900;color:var(--teal)}
            .insp-header-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
            .insp-header-grid .full{grid-column:1/-1}
            .insp-progress-bar-wrap{height:8px;border-radius:999px;background:#e8eef1;overflow:hidden;margin-top:4px}
            .insp-progress-bar{height:100%;border-radius:999px;background:var(--teal);transition:width .3s}
            .insp-progress-label{font-size:12px;color:var(--muted);font-weight:700;text-align:right;margin-top:2px}
            .insp-cat{background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden}
            .insp-cat-head{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f6f9fa;border-bottom:1px solid var(--line);font-weight:900;font-size:13px}
            .insp-cat-label{background:var(--teal);color:#fff;border-radius:6px;padding:2px 8px;font-size:11px}
            .insp-cat-sub{color:var(--muted);font-size:12px;font-weight:700}
            .insp-item{padding:10px 14px;border-bottom:1px solid #f0f4f5;display:grid;gap:6px}
            .insp-item:last-child{border-bottom:0}
            .insp-item-text{font-size:13px;font-weight:700;color:var(--ink);line-height:1.45}
            .insp-btns{display:flex;gap:6px}
            .insp-btn{flex:1;min-height:42px;border-radius:8px;border:2px solid #d1dce0;background:#f6f9fa;font-size:12px;font-weight:900;cursor:pointer;transition:.12s;color:#52636b}
            .insp-btn:active{transform:scale(.96)}
            .insp-btn[data-v="양호"].sel{background:#d1fae5;border-color:#10b981;color:#065f46}
            .insp-btn[data-v="불량"].sel{background:#fee2e2;border-color:#ef4444;color:#991b1b}
            .insp-btn[data-v="해당없음"].sel{background:#f3f4f6;border-color:#9ca3af;color:#4b5563}
            .insp-memo{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:6px;padding:5px 8px;font-size:12px;min-height:32px;resize:none;font-family:inherit;color:var(--ink);background:#fff}
            .insp-save-btn{width:100%;min-height:52px;border-radius:10px;border:0;background:var(--teal);color:#fff;font-size:15px;font-weight:900;cursor:pointer;margin-top:4px}
            .insp-save-btn:active{opacity:.85}
            .insp-new-btn{width:100%;min-height:52px;border-radius:10px;border:2px dashed var(--teal);background:#f2fbfc;color:var(--teal);font-size:15px;font-weight:900;cursor:pointer}
            .insp-new-btn:active{background:#e6f8fa}
            .insp-list{background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden}
            .insp-list-head{padding:12px 14px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}
            .insp-list-head h3{margin:0;font-size:14px;font-weight:900}
            .insp-list-item{padding:11px 14px;border-bottom:1px solid #f0f4f5;display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;cursor:pointer}
            .insp-list-item:last-child{border-bottom:0}
            .insp-list-item:hover{background:#f6f9fa}
            .insp-list-meta{font-size:12px;color:var(--muted);margin-top:2px}
            .insp-badge{font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px}
            .insp-badge-ok{background:#d1fae5;color:#065f46}
            .insp-badge-fail{background:#fee2e2;color:#991b1b}
            .insp-badge-wip{background:#fef3c7;color:#92400e}
            .insp-empty{text-align:center;color:var(--muted);padding:32px;font-size:13px}
            @media(max-width:600px){.insp-header-grid{grid-template-columns:1fr}.insp-btns{gap:4px}.insp-btn{font-size:11px;min-height:44px}}
          #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
        }
      }
      function ensureReportNav(){
        if(!state.nav.some(n=>n.label==="보고서")){
          const fileIndex=state.nav.findIndex(n=>n.label.includes("프로젝트 파일"));
          const adminIndex=state.nav.findIndex(n=>n.label.includes("관리자"));
          const insertAt=fileIndex>=0?fileIndex+1:(adminIndex>=0?adminIndex:state.nav.length);
          state.nav.splice(insertAt,0,{icon:"▣",label:"보고서"});
        }
      }
      const baseNormalizeForReports=normalizeState;
      normalizeState=function(){baseNormalizeForReports();ensureReportNav()};
      const baseViewForLabelForReports=viewForLabel;
      viewForLabel=function(label){return label.includes("보고서")?"reports":baseViewForLabelForReports(label)};
      const baseIsActiveForReports=isActive;
      isActive=function(label){return currentView==="reports"?label.includes("보고서"):baseIsActiveForReports(label)};
      const baseRenderViewForReports=renderView;
      renderView=function(){
        injectReportChrome();
        baseRenderViewForReports();
        const isReport=currentView==="reports";
        els.reportView.classList.toggle("hidden",!isReport);
        if(els.driveView)els.driveView.classList.toggle("hidden",currentView!=="drive");
        document.body.classList.toggle("report-page",isReport);
        $("#sharedNotice")?.classList.toggle("hidden",isReport);
        if(isReport){
          $("#kpis").classList.add("hidden");
          els.dashboardView.classList.add("hidden");
          els.adminView.classList.add("hidden");
          els.mainGrid.classList.add("hidden");
        }
      };
      const baseRenderCurrentForReports=renderCurrentContent;
      renderCurrentContent=function(){
        if(currentView==="reports"){syncViewChrome();renderReportView();return}
        baseRenderCurrentForReports();
      };
      const baseSyncViewChromeForReports=syncViewChrome;
      syncViewChrome=function(){
        baseSyncViewChromeForReports();
        if(currentView==="reports"){
          els.pageTitle.textContent="보고서";
          els.pageSub.textContent="A/S, 시공월별보고서, 기타 보고서를 작성하고 출력합니다.";
          const top=$("#addProjectBtn");
          if(top){top.textContent=reportTab==="A/S"?"보고서 인쇄":reportTab==="시공월별보고서"?"A4 출력":reportTab==="기타"?"A4 출력":reportTab==="시공검수"?"검수 저장":reportTab;top.disabled=false;top.classList.toggle("primary",true)}
        }
      };
      const baseGoToViewForReports=goToView;
      goToView=function(view,label=""){baseGoToViewForReports(view,label);if(view==="reports"){syncViewChrome();renderReportView();applyMasking()}};
      function reportVal(id){return $("#"+id)?.value||""}
      function photoCell(src,label){return `<div class="as-photo-cell"><div class="as-photo-label">${label}</div>${src?`<img src="${src}" alt="${label}">`:`<div class="as-photo-empty">사진 없음</div>`}</div>`}
      function renderAsSheet(){
        const before=[...beforePhotos],after=[...afterPhotos];
        while(before.length<3)before.push("");while(after.length<3)after.push("");
        const hasSite=reportVal("asSite")||reportVal("asClient");
        return `<div class="as-sheet" id="asReportSheet" style="padding:16px 18px">
          <div style="display:grid;grid-template-columns:1fr auto;align-items:center;border-bottom:3px solid #111;padding-bottom:7px;margin-bottom:0">
            <div><div style="font-size:10px;font-weight:700;color:#333;letter-spacing:.5px;margin-bottom:2px">기술지원팀</div><h2 style="margin:0;font-size:20px;font-weight:900;color:#111">A/S 처리완료 보고서</h2></div>
            <div style="text-align:right;font-size:11px;color:#333;line-height:1.7">
              <div>접수번호: <strong>${esc(reportVal("asNo")||"-")}</strong></div>
              <div>접수일: ${esc(reportVal("asReceived")||"-")} / 완료일: ${esc(reportVal("asCompleted")||"-")}</div>
            </div>
          </div>
          <div class="as-section-title" style="margin-top:0;border-top:0;background:#f0f4f7;border-bottom:2px solid #333;padding:4px 10px;font-size:12px;font-weight:900;color:#111">1. 기본 정보</div>
          <table class="as-table"><tbody>
            <tr><th>현장명</th><td colspan="3" style="font-weight:700">${esc(reportVal("asSite"))}</td><th>연락처</th><td>${esc(reportVal("asPhone"))}</td></tr>
            <tr><th>발주처</th><td colspan="3">${esc(reportVal("asClient"))}</td><th>용량(kW)</th><td>${esc(reportVal("asKw"))}</td></tr>
            <tr><th>주소</th><td colspan="3">${esc(reportVal("asAddress"))}</td><th>시공년월</th><td>${esc(reportVal("asBuilt"))}</td></tr>
            <tr><th>지붕유형</th><td>${esc(reportVal("asRoof"))}</td><th>접수일</th><td>${esc(reportVal("asReceived"))}</td><th>완료일</th><td>${esc(reportVal("asCompleted"))}</td></tr>
          </tbody></table>
          <div class="as-section-title" style="background:#f0f4f7;border-bottom:2px solid #333;padding:4px 10px;font-size:12px;font-weight:900;color:#111;border-top:1px solid #ccc">2. 하자 내용</div>
          <table class="as-table"><tbody>
            <tr><th>하자유형</th><td>${esc(reportVal("asDefectType"))}</td><th>발생부위</th><td colspan="3">${esc(reportVal("asDefectArea"))}</td></tr>
            <tr><th>증상</th><td colspan="5" style="min-height:38px">${esc(reportVal("asSymptom"))}</td></tr>
            <tr><th>원인</th><td colspan="5">${esc(reportVal("asCause"))}</td></tr>
          </tbody></table>
          <div class="as-section-title" style="background:#f0f4f7;border-bottom:2px solid #333;padding:4px 10px;font-size:12px;font-weight:900;color:#111;border-top:1px solid #ccc">3. 조치 및 마감</div>
          <table class="as-table"><tbody>
            <tr><th>조치내용</th><td colspan="5" style="min-height:44px;white-space:pre-wrap">${esc(reportVal("asAction"))}</td></tr>
            <tr><th>사용자재</th><td colspan="3">${esc(reportVal("asMaterial"))}</td><th>마감상태</th><td>${esc(reportVal("asFinish"))}</td></tr>
            <tr><th>고객확인</th><td colspan="2">${esc(reportVal("asCustomerCheck"))}</td><th>사후안내</th><td colspan="2">${esc(reportVal("asNotice"))}</td></tr>
          </tbody></table>
          <div class="as-section-title" style="background:#f0f4f7;border-bottom:2px solid #333;padding:4px 10px;font-size:12px;font-weight:900;color:#111;border-top:1px solid #ccc">4. 작업 사진 (전·후)</div>
          <div class="as-photo-grid">${before.slice(0,3).map(x=>photoCell(x,"작업 전")).join("")}${after.slice(0,3).map(x=>photoCell(x,"작업 후")).join("")}</div>
          <div class="as-section-title" style="background:#f0f4f7;border-bottom:2px solid #333;padding:4px 10px;font-size:12px;font-weight:900;color:#111;border-top:1px solid #ccc">5. 확인 서명</div>
          <div class="as-sign-row">
            <div style="display:grid;grid-template-rows:auto 1fr;padding:5px 10px;gap:2px"><span style="font-weight:900;font-size:11px">작업자</span><span style="font-size:10px;color:#666">&nbsp;</span></div>
            <div style="display:grid;grid-template-rows:auto 1fr;padding:5px 10px;gap:2px"><span style="font-weight:900;font-size:11px">팀장 확인</span><span style="font-size:10px;color:#666">&nbsp;</span></div>
            <div style="display:grid;grid-template-rows:auto 1fr;padding:5px 10px;gap:2px"><span style="font-weight:900;font-size:11px">고객 서명</span><span style="font-size:10px;color:#666">&nbsp;</span></div>
          </div>
          <div style="margin-top:5px;text-align:right;font-size:10px;font-weight:700;color:#444">보고: 기술지원팀</div>
        </div>`;
      }
      function renderReportHistoryList(records,tab){
        if(!records||!records.length)return`<div style="font-size:12px;color:var(--muted);padding:8px 0">저장된 이력이 없습니다.</div>`;
        return[...records].reverse().map((r,ri)=>{
          const i=records.length-1-ri;
          let label="",sub="";
          if(tab==="A/S"){label=r.asSite||r.asNo||"이름 없음";sub=`${r.asReceived||""} · ${r.asClient||""}`}
          else if(tab==="월별"){label=`${r.ym||""} 보고서`;sub=`완료 ${r.count||0}건 · ${r.totalKw||0}kW`}
          else{label=r.genericTitle||"제목 없음";sub=`${r.genericDate||""} · ${r.genericCategory||""}`}
          return`<div style="display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:6px;padding:7px 0;border-bottom:1px solid #f0f4f5"><div style="min-width:0"><div style="font-size:12px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(label)}</div><div style="font-size:11px;color:var(--muted)">${esc(sub)}</div></div><button class="btn" style="font-size:11px;padding:2px 8px;min-height:26px" data-hist-load-${tab.replace("/","")}="${i}">불러오기</button><button class="btn danger" style="font-size:11px;padding:2px 8px;min-height:26px" data-hist-del-${tab.replace("/","")}="${i}">삭제</button></div>`;
        }).join("");
      }
      function reportHistorySection(records,tab){
        return`<details style="margin-top:12px"><summary style="cursor:pointer;font-size:12px;font-weight:900;color:var(--teal);padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px">📁 저장 이력 (${records?.length||0}건)</summary><div style="margin-top:6px">${renderReportHistoryList(records,tab)}</div></details>`;
      }
      function renderReportForm(){
        const hist=reportHistorySection(state.asReports||[],"AS");
        return `<div class="report-form">
          <div class="panel-title"><h2>A/S 보고서 작성</h2><button class="btn primary" id="saveAsReportBtn" type="button">💾 저장</button></div>
          <div class="form-row full">
            <label>DB 검색</label>
            <input class="field" id="asDbSearch" placeholder="발전소명 또는 사업주명 검색">
            <div class="report-db-results" id="asDbResults"></div>
          </div>
          <div class="report-form-grid">
            <input class="field" id="asNo" placeholder="접수번호" value="A1"><input class="field" type="date" id="asReceived" value="${today}">
            <input class="field" type="date" id="asCompleted" value="${today}"><input class="field" id="asPhone" placeholder="연락처">
            <input class="field" id="asSite" placeholder="현장명"><input class="field" id="asClient" placeholder="발주처">
            <input class="field full" id="asAddress" placeholder="주소">
            <input class="field" id="asKw" placeholder="용량(kW)"><input class="field" id="asRoof" placeholder="지붕유형">
            <input class="field" id="asBuilt" placeholder="시공년월"><input class="field" id="asDefectType" placeholder="하자유형">
            <input class="field" id="asDefectArea" placeholder="발생부위"><input class="field full" id="asSymptom" placeholder="증상">
            <input class="field full" id="asCause" placeholder="원인">
            <textarea class="field full" id="asAction" placeholder="조치내용"></textarea>
            <input class="field full" id="asMaterial" placeholder="사용자재">
            <input class="field" id="asFinish" placeholder="마감상태"><input class="field" id="asCustomerCheck" placeholder="고객확인">
            <input class="field full" id="asNotice" placeholder="사후안내">
          </div>
          <div class="label">사진 드래그 등록</div>
          <div class="report-photo-board" id="asPhotoDropBoard">
            <div class="report-drop-zone" data-photo-drop="before"><span class="report-drop-title">작업 전 사진</span><span class="report-drop-hint">사진을 여기에 끌어놓으면<br>보고서 작업 전 칸에 순서대로 들어갑니다.</span><span class="report-drop-count" id="beforePhotoCount">0/3장</span></div>
            <div class="report-drop-zone" data-photo-drop="after"><span class="report-drop-title">작업 후 사진</span><span class="report-drop-hint">사진을 여기에 끌어놓으면<br>보고서 작업 후 칸에 순서대로 들어갑니다.</span><span class="report-drop-count" id="afterPhotoCount">0/3장</span></div>
          </div>
          <input class="hidden" type="file" id="asBeforeInput" accept="image/*" multiple>
          <input class="hidden" type="file" id="asAfterInput" accept="image/*" multiple>
          ${hist}
        </div>`;
      }
      const monthlyReportDefaults={salesRate:220000,structureRate:65000,electricRate:85000,equipmentRate:12000,otherCostRate:8000,vatRate:0,companyRate:0};
      function monthlyReportSettings(){const saved=state.monthlyReportSettings||{},merged={...monthlyReportDefaults,...saved};if(!Number(merged.salesRate)){const cost=Number(merged.structureRate)+Number(merged.electricRate)+Number(merged.equipmentRate)+Number(merged.otherCostRate);merged.salesRate=Math.round(cost*(1+Number(merged.companyRate||0)/100))||monthlyReportDefaults.salesRate}return merged}
      function fmtWon(n){return `${Math.round(Number(n)||0).toLocaleString("ko-KR")}원`}
      function fmtKw(n){return `${(Math.round((Number(n)||0)*100)/100).toLocaleString("ko-KR")}kW`}
      function fmtRate(n){return `${(Math.round((Number(n)||0)*10)/10).toLocaleString("ko-KR")}%`}
      function selectedReportMonth(){return $("#monthlyReportMonth")?.value||today.slice(0,7)}
      function completedConstructionRows(ym=selectedReportMonth()){return (state.construction||[]).filter(c=>((c.end||"").startsWith(ym)||(c.status==="완료"&&!c.end&&String(c.start||"").startsWith(ym)))&&(c.status==="완료"||c.phase==="완료"||String(c.end||"").startsWith(ym)))}
      function monthlyCompanyName(c){const raw=String(c.company||"미지정").trim();return (state.constructionTeams||["동광","다온","남해","다호","금태양","JW","보강"]).find(x=>raw.includes(x))||raw||"미지정"}
      function monthlyCostPerKw(s=monthlyReportSettings()){return Number(s.structureRate)+Number(s.electricRate)+Number(s.equipmentRate)+Number(s.otherCostRate)}
      function monthlyRows(){
        const s=monthlyReportSettings(),costPerKw=monthlyCostPerKw(s),salesPerKw=Number(s.salesRate)||0,rows=completedConstructionRows(),map=new Map();
        (state.constructionTeams||["동광","다온","남해","다호","금태양","JW","보강"]).forEach(name=>map.set(name,{name,count:0,kw:0,sales:0,cost:0,profit:0,sites:[]}));
        rows.forEach(c=>{const name=monthlyCompanyName(c),kw=Number(c.kw)||0;if(!map.has(name))map.set(name,{name,count:0,kw:0,sales:0,cost:0,profit:0,sites:[]});const r=map.get(name);r.count++;r.kw+=kw;r.cost+=kw*costPerKw;r.sales+=kw*salesPerKw;r.profit=r.sales-r.cost;r.sites.push(c)});
        return [...map.values()].map(r=>({...r,kw:Math.round(r.kw*100)/100,sales:Math.round(r.sales),cost:Math.round(r.cost),profit:Math.round(r.profit),margin:r.sales?Math.round((r.profit/r.sales)*1000)/10:0}));
      }
      function monthlyTotals(rows=monthlyRows()){const t=rows.reduce((a,r)=>({count:a.count+r.count,kw:a.kw+r.kw,sales:a.sales+r.sales,cost:a.cost+r.cost,profit:a.profit+r.profit}),{count:0,kw:0,sales:0,cost:0,profit:0});return {...t,margin:t.sales?Math.round((t.profit/t.sales)*1000)/10:0}}
      function monthlyCostBreakdown(kw,s=monthlyReportSettings()){return {structure:kw*Number(s.structureRate),electric:kw*Number(s.electricRate),equipment:kw*Number(s.equipmentRate),other:kw*Number(s.otherCostRate)}}
      function renderMonthlyReportSheet(){
        const ym=selectedReportMonth(),rows=monthlyRows(),total=monthlyTotals(rows),s=monthlyReportSettings(),unitCost=monthlyCostPerKw(s),unitProfit=Number(s.salesRate)-unitCost,unitMargin=Number(s.salesRate)?unitProfit/Number(s.salesRate)*100:0,totalBreak=monthlyCostBreakdown(total.kw,s);
        return `<div class="monthly-a4 clean-monthly" id="monthlyReportSheet"><div class="monthly-title-block" style="display:grid;grid-template-columns:1fr auto;align-items:flex-end"><div><h2 style="font-size:22px;font-weight:900;color:#111;margin:0 0 4px">시공 월별 실적 및 손익 보고서</h2><div class="subtitle" style="color:#333;font-size:12px">${esc(ym)} 기준 · 작성일 ${esc(localDateString())} · 기술지원팀</div></div><div style="font-size:11px;color:#444;text-align:right;padding-bottom:2px">페이지 1 / 1</div></div>
          <div class="monthly-kpis"><div class="monthly-kpi"><span>완료 현장</span><strong>${total.count}건</strong></div><div class="monthly-kpi"><span>완료 용량</span><strong>${fmtKw(total.kw)}</strong></div><div class="monthly-kpi"><span>예상 매출</span><strong>${fmtWon(total.sales)}</strong></div><div class="monthly-kpi profit"><span>예상 이익</span><strong>${fmtWon(total.profit)}</strong><em>이익률 ${fmtRate(total.margin)}</em></div></div>
          <table class="monthly-table summary"><colgroup><col style="width:13%"><col style="width:9%"><col style="width:13%"><col style="width:18%"><col style="width:18%"><col style="width:18%"><col style="width:11%"></colgroup><thead><tr><th>계열사</th><th>완료</th><th>용량</th><th>예상 매출</th><th>예상 원가</th><th>예상 이익</th><th>이익률</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.count}건</td><td>${fmtKw(r.kw)}</td><td>${fmtWon(r.sales)}</td><td>${fmtWon(r.cost)}</td><td><strong class="${r.profit<0?"monthly-loss":"monthly-profit"}">${fmtWon(r.profit)}</strong></td><td>${fmtRate(r.margin)}</td></tr>`).join(""):`<tr><td class="monthly-empty" colspan="7">선택한 월에 완료된 시공일정이 없습니다.</td></tr>`}<tr><th colspan="2">합계</th><th>${fmtKw(total.kw)}</th><th>${fmtWon(total.sales)}</th><th>${fmtWon(total.cost)}</th><th>${fmtWon(total.profit)}</th><th>${fmtRate(total.margin)}</th></tr></tbody></table>
          <table class="monthly-table cost"><colgroup><col style="width:23%"><col style="width:18%"><col style="width:20%"><col style="width:39%"></colgroup><thead><tr><th>원가 구분</th><th>kW당 단가</th><th>월 합계</th><th>설명</th></tr></thead><tbody><tr><td>구조물 시공비</td><td>${fmtWon(s.structureRate)}</td><td>${fmtWon(totalBreak.structure)}</td><td>구조물 설치/시공 인건비 기준</td></tr><tr><td>전기 시공비</td><td>${fmtWon(s.electricRate)}</td><td>${fmtWon(totalBreak.electric)}</td><td>전기공사 시공비 기준</td></tr><tr><td>장비/운반비</td><td>${fmtWon(s.equipmentRate)}</td><td>${fmtWon(totalBreak.equipment)}</td><td>장비대, 운반, 현장 투입비 기준</td></tr><tr><td>기타 경비</td><td>${fmtWon(s.otherCostRate)}</td><td>${fmtWon(totalBreak.other)}</td><td>소모품, 잡자재, 기타 현장비 기준</td></tr></tbody></table>
          <div class="monthly-note"><strong>산정 기준</strong><br>예상 매출: 완료 용량 × kW당 예상 매출 단가 ${fmtWon(s.salesRate)}<br>예상 원가: 완료 용량 × kW당 예상 원가 ${fmtWon(unitCost)} (구조물+전기+장비/운반+기타)<br>kW당 예상 이익: ${fmtWon(unitProfit)} / 예상 이익률: ${fmtRate(unitMargin)}<br>실제 계약금액과 외주 정산금액이 입력되면, 해당 실제 금액 기준으로 교체해 더 정확한 손익 보고서로 확장할 수 있습니다.</div>
          <table class="monthly-table detail"><colgroup><col style="width:13%"><col style="width:45%"><col style="width:12%"><col style="width:15%"><col style="width:15%"></colgroup><thead><tr><th>계열사</th><th>완료 현장</th><th>kW</th><th>예상 이익</th><th>완료일</th></tr></thead><tbody>${rows.flatMap(r=>r.sites.map(c=>{const kw=Number(c.kw)||0,profit=kw*unitProfit;return `<tr><td>${esc(r.name)}</td><td><div>${esc(c.site||"")}</div><div class="monthly-detail">${esc([c.customer,c.next].filter(Boolean).join(" · ").slice(0,90))}</div></td><td>${fmtKw(kw)}</td><td>${fmtWon(profit)}</td><td>${esc(c.end||c.start||"")}</td></tr>`})).join("")||`<tr><td class="monthly-empty" colspan="5">상세 현장이 없습니다.</td></tr>`}</tbody></table>
          <div class="monthly-stamp">보고: 기술지원팀</div></div>`;
      }
      function monthlyInput(id,label,value,help){
        return `<label class="monthly-input"><span>${label}</span><input class="field" type="number" id="${id}" value="${esc(value)}"><small>${help}</small></label>`
      }
      function renderMonthlyReportForm(){
        const s=monthlyReportSettings(),unitCost=monthlyCostPerKw(s),unitProfit=Number(s.salesRate)-unitCost;
        const hist=reportHistorySection(state.monthlyReports||[],"월별");
        return `<div class="report-form monthly-report-controls"><div class="panel-title"><h2>시공월별보고서</h2><div style="display:flex;gap:6px"><button class="btn primary" id="saveMonthlyReportBtn" type="button">💾 저장</button><button class="btn primary" id="printMonthlyReportBtn" type="button">A4 출력</button></div></div><label>보고 월</label><input class="field" type="month" id="monthlyReportMonth" value="${esc(selectedReportMonth())}"><div class="label">매출 기준</div><div class="monthly-rate-grid single">${monthlyInput("monthlySalesRate","kW당 예상 매출 단가",s.salesRate,"완료 용량 × 이 단가 = 예상 매출")}</div><div class="label">원가 기준</div><div class="monthly-rate-grid">${monthlyInput("monthlyStructureRate","구조물 시공비 / kW",s.structureRate,"구조물 설치·시공 원가")}${monthlyInput("monthlyElectricRate","전기 시공비 / kW",s.electricRate,"전기공사 시공 원가")}${monthlyInput("monthlyEquipmentRate","장비·운반비 / kW",s.equipmentRate,"장비대, 운반, 현장 투입비")}${monthlyInput("monthlyOtherCostRate","기타 경비 / kW",s.otherCostRate,"소모품, 잡자재, 기타 현장비")}</div><div class="monthly-rate-summary"><strong>kW당 예상 원가 ${fmtWon(unitCost)}</strong><span>kW당 예상 이익 ${fmtWon(unitProfit)}</span></div><p class="meta">위 단가는 예측용입니다.</p>${hist}</div>`
      }
      function genericReporterName(){return typeof loginName==="function"?loginName():""}
      function genericVal(id){return $("#"+id)?.value||""}
      function genericLines(id){return esc(genericVal(id)||"-")}
      function renderGenericPhotos(){
        if(!genericPhotos.length)return "";
        const items=genericPhotos.map((src,i)=>'<div><img src="'+src+'" alt="첨부 사진 '+(i+1)+'"><span>사진 '+(i+1)+'</span></div>').join("");
        return '<div class="generic-section-title">5. 첨부 사진</div><div class="generic-photo-grid">'+items+'</div>';
      }
      function renderGenericSheet(){
        const reporter=genericVal("genericReporter")||genericReporterName();
        /* 빈 값이면 행 자체를 생략 */
        const gRow=(label,id)=>{const v=genericVal(id);return v?`<tr><th style="white-space:nowrap">${label}</th><td style="white-space:pre-wrap;word-break:keep-all">${esc(v)}</td></tr>`:""};
        const gRow2=(l1,id1,l2,id2)=>{const v1=genericVal(id1),v2=genericVal(id2);if(!v1&&!v2)return "";return `<tr><th>${l1}</th><td>${v1?esc(v1):"-"}</td><th>${l2}</th><td>${v2?esc(v2):"-"}</td></tr>`;};
        const sec=(title,rows)=>{const body=rows.join("");return body?`<div class="generic-section-title">${title}</div><table class="generic-table"><tbody>${body}</tbody></table>`:""};
        const s1=gRow2("보고 구분","genericCategory","작성 부서","genericDept")+gRow2("관련 현장","genericSite","대상/업체","genericTarget");
        const s2=gRow("핵심 요약","genericSummary")+gRow("배경/경위","genericBackground");
        const s3=gRow("문제/상황","genericIssue")+gRow("조치 내용","genericAction")+gRow("현재 결과","genericResult");
        const s4=gRow("요청사항","genericRequest")+gRow("다음 조치","genericNext")+gRow("비고","genericMemo");
        return `<div class="generic-sheet" id="genericReportSheet">
          <div style="display:grid;grid-template-columns:1fr auto;align-items:flex-end;border-bottom:3px solid #111;padding-bottom:8px;margin-bottom:8px">
            <div><div style="font-size:11px;font-weight:700;color:#333;letter-spacing:.5px;margin-bottom:2px">기술지원팀</div><h2 style="margin:0;font-size:22px;font-weight:900;color:#111">${esc(genericVal("genericTitle")||"업무 보고서")}</h2></div>
            <div style="text-align:right;font-size:11px;color:#333;line-height:1.7"><div>${esc(genericVal("genericDate")||today)}</div><div>작성자: <strong>${esc(reporter||"미입력")}</strong> / ${esc(genericVal("genericDept")||"기술지원팀")}</div></div>
          </div>
          ${sec("1. 기본 정보",[s1])}${sec("2. 보고 요약",[s2])}${sec("3. 내용 및 조치",[s3])}${sec("4. 요청 및 후속 조치",[s4])}
          ${renderGenericPhotos()}
          <div style="margin-top:10px;text-align:right;font-size:11px;font-weight:700;color:#333">보고: 기술지원팀</div></div>`
      }
      function renderGenericReportForm(){
        const reporter=esc(genericReporterName());
        const clearPhotoClass=genericPhotos.length?"":"hidden";
        const hist=reportHistorySection(state.genericReports||[],"기타");
        return `<div class="report-form generic-report-form"><div class="panel-title"><h2>기타 보고서</h2><div style="display:flex;gap:6px"><button class="btn primary" id="saveGenericReportBtn" type="button">💾 저장</button><button class="btn primary" id="printGenericReportBtn" type="button">A4 출력</button></div></div><div class="report-form-grid"><input class="field full" id="genericTitle" placeholder="보고서 제목" value="업무 보고서"><input class="field" type="date" id="genericDate" value="${today}"><input class="field" id="genericReporter" placeholder="작성자" value="${reporter}"><input class="field" id="genericDept" placeholder="작성 부서" value="기술지원팀"><select class="field" id="genericCategory"><option>일반보고</option><option>현장보고</option><option>사고/하자 보고</option><option>고객 민원</option><option>자재/시공 이슈</option><option>업체 협의</option><option>긴급 보고</option></select><input class="field" id="genericSite" placeholder="관련 현장/발전소"><input class="field full" id="genericTarget" placeholder="대상/업체/고객"></div><textarea class="field wide-textarea" id="genericSummary" placeholder="핵심 요약: 무엇을 보고하는지 한두 문장으로 적습니다."></textarea><textarea class="field" id="genericBackground" placeholder="배경/경위: 언제, 어디서, 어떤 흐름으로 발생했는지 적습니다."></textarea><textarea class="field" id="genericIssue" placeholder="문제/상황: 확인된 문제, 원인 추정, 영향 범위를 적습니다."></textarea><textarea class="field" id="genericAction" placeholder="조치 내용: 이미 조치한 내용이나 협의 내용을 적습니다."></textarea><textarea class="field" id="genericResult" placeholder="현재 결과: 해결 여부, 남은 문제, 현재 상태를 적습니다."></textarea><textarea class="field" id="genericRequest" placeholder="요청사항: 결재, 비용 승인, 업체 요청, 고객 안내 등 필요한 사항을 적습니다."></textarea><textarea class="field" id="genericNext" placeholder="다음 조치: 담당자, 예정일, 후속 확인 사항을 적습니다."></textarea><textarea class="field" id="genericMemo" placeholder="비고"></textarea><div class="generic-photo-drop" id="genericPhotoDrop">사진이 필요할 때만 여기에 드래그하거나 클릭하세요<br><span class="meta">사진을 넣으면 보고서에 첨부 사진 섹션이 자동으로 생깁니다.</span></div><input class="hidden" type="file" id="genericPhotoInput" accept="image/*" multiple><button class="btn danger ${clearPhotoClass}" id="clearGenericPhotosBtn" type="button">첨부 사진 비우기</button>${hist}</div>`
      }
      function readGenericDraft(){try{return JSON.parse(localStorage.getItem(genericDraftKey)||"{}")}catch{return{}}}
      function saveGenericDraft(){const data={};genericFieldIds.forEach(id=>{const el=$("#"+id);if(el)data[id]=el.value||""});localStorage.setItem(genericDraftKey,JSON.stringify(data))}
      function restoreGenericDraft(){const data=readGenericDraft();genericFieldIds.forEach(id=>{const el=$("#"+id);if(el&&data[id]!==undefined)el.value=data[id]});$(".report-preview").innerHTML=renderGenericSheet()}
      function refreshGenericReport(){saveGenericDraft();$(".report-preview").innerHTML=renderGenericSheet()}
      function addGenericPhotos(files){const picked=[...files].filter(f=>f.type.startsWith("image/")).slice(0,6-genericPhotos.length);if(!picked.length){toast("사진은 최대 6장까지 넣을 수 있습니다.");return}Promise.all(picked.map(file=>new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(file)}))).then(urls=>{genericPhotos=[...genericPhotos,...urls].slice(0,6);refreshGenericReport();renderReportView();toast(`사진 ${urls.length}장을 첨부했습니다.`)})}
      function printGenericReport(){_doPrint(renderGenericSheet(),"A4 출력")}
      function readAsDraft(){try{return JSON.parse(localStorage.getItem(asDraftKey)||"{}")}catch{return{}}}
      function saveAsDraft(){const data={};asFieldIds.forEach(id=>{const el=$("#"+id);if(el)data[id]=el.value||""});localStorage.setItem(asDraftKey,JSON.stringify(data))}
      function restoreAsDraft(){const data=readAsDraft();asFieldIds.forEach(id=>{const el=$("#"+id);if(el&&data[id]!==undefined)el.value=data[id]});$(".report-preview").innerHTML=renderAsSheet()}
      function updatePhotoCounts(){
        const before=$("#beforePhotoCount"),after=$("#afterPhotoCount");
        if(before)before.textContent=`${beforePhotos.length}/3장`;
        if(after)after.textContent=`${afterPhotos.length}/3장`;
      }
      function saveMonthlySettings(){
        state.monthlyReportSettings={salesRate:Number($("#monthlySalesRate")?.value)||0,structureRate:Number($("#monthlyStructureRate")?.value)||0,electricRate:Number($("#monthlyElectricRate")?.value)||0,equipmentRate:Number($("#monthlyEquipmentRate")?.value)||0,otherCostRate:Number($("#monthlyOtherCostRate")?.value)||0};
        state.__updatedAt=Date.now();
        localStorage.setItem(storageKey,JSON.stringify(state));
        if(typeof scheduleSharedSave==="function")scheduleSharedSave(1200);
      }
      function refreshMonthlyReport(){saveMonthlySettings();$(".report-preview").innerHTML=renderMonthlyReportSheet()}
      const DRIVE_FOLDER_KEY="report-drive-folder-url-v1";
      function openDriveFolder(){
        const saved=localStorage.getItem(DRIVE_FOLDER_KEY)||"";
        const url=window.prompt("구글 드라이브 폴더 URL을 입력하세요\n(저장 후 버튼을 누르면 바로 열립니다)",saved||"https://drive.google.com/drive/folders/");
        if(url===null)return;
        if(url.trim()){localStorage.setItem(DRIVE_FOLDER_KEY,url.trim());window.open(url.trim(),"_blank")}
        else{localStorage.removeItem(DRIVE_FOLDER_KEY);toast("드라이브 URL이 삭제됐습니다.")}
      }
      function enterReportFocusMode(){
        document.body.classList.add("report-focus-mode");
        const bar=document.createElement("div");
        bar.className="report-focus-bar";
        bar.id="reportFocusBar";
        bar.innerHTML=`<span style="flex:1">📄 집중 모드 — A4 보고서 작성 중</span><button class="report-focus-exit" id="exitReportFocusBtn">✕ 나가기</button>`;
        document.body.insertAdjacentElement("afterbegin",bar);
        document.getElementById("exitReportFocusBtn")?.addEventListener("click",exitReportFocusMode);
      }
      function exitReportFocusMode(){
        document.body.classList.remove("report-focus-mode");
        document.getElementById("reportFocusBar")?.remove();
      }
      /* ── 시공검수 ── */
      function readInspDraft(){try{return JSON.parse(localStorage.getItem(inspDraftKey)||"null")}catch{return null}}
      function saveInspDraft(d){localStorage.setItem(inspDraftKey,JSON.stringify(d))}
      function clearInspDraft(){localStorage.removeItem(inspDraftKey)}
      function inspProgress(draft){
        let total=0,done=0;
        INSP_CHECKLIST.forEach((sec,si)=>sec.items.forEach((_,ii)=>{total++;if(draft.checks?.[si+"_"+ii])done++}));
        return{total,done,pct:total?Math.round(done/total*100):0};
      }
      function inspBadge(draft){
        const hasFail=Object.values(draft.checks||{}).includes("불량");
        const {done,total}=inspProgress(draft);
        if(done===total&&total>0)return hasFail?`<span class="insp-badge insp-badge-fail">불량 항목</span>`:`<span class="insp-badge insp-badge-ok">점검 완료</span>`;
        return `<span class="insp-badge insp-badge-wip">진행중 ${done}/${total}</span>`;
      }
      function renderInspectionListView(){
        if(!state.siteInspections)state.siteInspections=[];
        const list=state.siteInspections;
        const listHtml=list.length?[...list].reverse().map((d,ri)=>{
          const i=list.length-1-ri;
          return `<div class="insp-list-item" style="display:flex;align-items:center;gap:8px"><div style="flex:1;cursor:pointer" data-insp-load="${i}"><div style="font-weight:900;font-size:13px">${esc(d.site||"발전소명 미입력")} <span style="font-weight:700;color:var(--muted);font-size:12px">${esc(d.phase||"")}</span></div><div class="insp-list-meta">${esc(d.date||"")} · ${esc(d.company||"")} · ${esc(d.inspector||"")}</div>${inspBadge(d)}</div><button class="btn icon danger" data-insp-delete="${i}" style="flex-shrink:0">×</button></div>`;
        }).join(""):`<div class="insp-empty">저장된 검수 기록이 없습니다.</div>`;
        return `<div class="insp-wrap"><button class="insp-new-btn" id="inspNewBtn">+ 새 검수 시작</button><div class="insp-list"><div class="insp-list-head"><h3>검수 기록</h3></div>${listHtml}</div></div>`;
      }
      function renderInspectionFormView(draft){
        if(!draft){draft={date:today,site:"",company:"",phase:"",inspector:loginName()||"",capacity:"",installType:"",checks:{},sectionMemos:{}}}
        const {done,total,pct}=inspProgress(draft);
        const headerHtml=`<div class="insp-header-card"><h3>📋 시공현장 검수체크리스트</h3><div style="position:relative;margin-bottom:12px"><input class="field" id="inspDbSearch" placeholder="🔍 DB 검색 (발전소명, 고객명 등)" style="width:100%"><div id="inspDbResults" class="construction-db-results hidden" style="position:absolute;z-index:100;left:0;right:0;top:100%;margin-top:2px;background:#fff;border:1px solid #ddd;border-radius:6px;max-height:220px;overflow-y:auto"></div></div><div class="insp-header-grid">
          <div><label class="meta" style="display:block;font-weight:900;margin-bottom:3px;font-size:12px">발전소명</label><input class="field" id="inspSite" value="${esc(draft.site||"")}" placeholder="발전소명"></div>
          <div><label class="meta" style="display:block;font-weight:900;margin-bottom:3px;font-size:12px">시공단계</label><input class="field" id="inspPhase" value="${esc(draft.phase||"")}" placeholder="구조물 1일차 등"></div>
          <div><label class="meta" style="display:block;font-weight:900;margin-bottom:3px;font-size:12px">시공사</label><input class="field" id="inspCompany" value="${esc(draft.company||"")}" placeholder="시공사명"></div>
          <div><label class="meta" style="display:block;font-weight:900;margin-bottom:3px;font-size:12px">점검자</label><input class="field" id="inspInspector" value="${esc(draft.inspector||"")}" placeholder="담당자명"></div>
          <div><label class="meta" style="display:block;font-weight:900;margin-bottom:3px;font-size:12px">일시</label><input class="field" id="inspDate" type="date" value="${esc(draft.date||today)}"></div>
          <div><label class="meta" style="display:block;font-weight:900;margin-bottom:3px;font-size:12px">용량(kW)</label><input class="field" id="inspCapacity" value="${esc(draft.capacity||"")}" placeholder="예: 216.32"></div>
          <div class="full"><label class="meta" style="display:block;font-weight:900;margin-bottom:3px;font-size:12px">설치형태</label><input class="field" id="inspInstallType" value="${esc(draft.installType||"")}" placeholder="축사 / 공장(창고) / 지상 등"></div>
        </div><div class="insp-progress-bar-wrap"><div class="insp-progress-bar" style="width:${pct}%"></div></div><div class="insp-progress-label">${done} / ${total} 항목 완료 (${pct}%)</div></div>`;
        const checklistHtml=INSP_CHECKLIST.map((sec,si)=>`<div class="insp-cat"><div class="insp-cat-head"><span class="insp-cat-label">${esc(sec.cat)}</span><span class="insp-cat-sub">${esc(sec.sub)}</span></div>${sec.items.map((item,ii)=>{const key=si+"_"+ii,val=draft.checks?.[key]||"";return`<div class="insp-item"><div class="insp-item-text">${esc(item)}</div><div class="insp-btns"><button class="insp-btn ${val==="양호"?"sel":""}" data-insp-key="${key}" data-v="양호">✓ 양호</button><button class="insp-btn ${val==="불량"?"sel":""}" data-insp-key="${key}" data-v="불량">✗ 불량</button><button class="insp-btn ${val==="해당없음"?"sel":""}" data-insp-key="${key}" data-v="해당없음">— 해당없음</button></div><input class="insp-memo" data-insp-memo="${key}" placeholder="특이사항 (선택)" value="${esc(draft.sectionMemos?.[key]||"")}"></div>`}).join("")}</div>`).join("");
        return `<div class="insp-wrap">${headerHtml}${checklistHtml}<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="inspBackBtn" style="min-height:52px;flex-shrink:0;padding:0 20px">← 목록</button><button class="insp-save-btn" id="inspSaveBtn" style="flex:2">💾 검수 저장</button><button class="insp-save-btn" id="inspPrintBtn" style="flex:1;background:#2b6cb0">🖨 PDF 출력</button></div></div>`;
      }
      function renderInspectionA4(draft){
        const catColors={안전:"#e53e3e",구조물:"#2b6cb0",전기:"#276749",한전시공:"#6b46c1",마감:"#c05621"};
        /* 2열 레이아웃: 왼쪽(안전+구조물) / 오른쪽(전기+한전+마감) */
        const leftSecs=[0,1,2],rightSecs=[3,4,5,6,7];
        function buildCol(secIdxs){
          return secIdxs.map(si=>{
            const sec=INSP_CHECKLIST[si];
            const itemRows=sec.items.map((item,ii)=>{
              const key=si+"_"+ii,val=draft.checks?.[key]||"",memo=draft.sectionMemos?.[key]||"";
              const dot=val==="양호"?`<span style="color:#276749;font-weight:900">✓</span>`:val==="불량"?`<span style="color:#c0392b;font-weight:900">✗</span>`:val==="해당없음"?`<span style="color:#888">N/A</span>`:`<span style="color:#ddd">·</span>`;
              return `<tr><td style="padding:2px 4px;font-size:9.5px;line-height:1.3;border-bottom:1px solid #eee">${esc(item)}${memo?`<span style="color:#888;font-size:8.5px"> (${esc(memo)})</span>`:""}</td><td style="text-align:center;width:26px;border-bottom:1px solid #eee;font-size:9.5px">${dot}</td></tr>`;
            }).join("");
            const color=catColors[sec.cat]||"#444";
            return `<tr><td colspan="2" style="background:${color};color:#fff;font-size:9px;font-weight:900;padding:3px 5px;letter-spacing:.3px">${esc(sec.cat)} · ${esc(sec.sub)}</td></tr>${itemRows}`;
          }).join("");
        }
        const leftRows=buildCol(leftSecs),rightRows=buildCol(rightSecs);
        const {done,total,pct}=inspProgress(draft);
        const failCount=Object.values(draft.checks||{}).filter(v=>v==="불량").length;
        const th=`background:#f1f6f8;border:1px solid #bbb;padding:4px 6px;font-size:10.5px`;
        const td=`border:1px solid #bbb;padding:4px 6px;font-size:10.5px`;
        return `<div style="width:100%;background:#fff;color:#111;font-family:'Malgun Gothic','Noto Sans KR',Arial,sans-serif;box-sizing:border-box">
          <h2 style="text-align:center;font-size:17px;margin:0 0 2px;letter-spacing:.5px">태양광발전설비 현장 점검기록표</h2>
          <p style="text-align:center;font-size:10px;color:#555;margin:0 0 8px">시공검수 체크리스트</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:7px">
            <tr><th style="${th};width:72px">발전소명</th><td style="${td}">${esc(draft.site||"")}</td><th style="${th};width:52px">용량</th><td style="${td};width:80px">${esc(draft.capacity||"")} kW</td><th style="${th};width:52px">점검자</th><td style="${td}">${esc(draft.inspector||"")}</td></tr>
            <tr><th style="${th}">시공사</th><td style="${td}">${esc(draft.company||"")}</td><th style="${th}">시공단계</th><td style="${td}">${esc(draft.phase||"")}</td><th style="${th}">일시</th><td style="${td}">${esc(draft.date||"")}</td></tr>
            <tr><th style="${th}">설치형태</th><td colspan="5" style="${td}">${esc(draft.installType||"")}</td></tr>
          </table>
          <table style="width:100%;border-collapse:collapse;margin-bottom:7px;table-layout:fixed">
            <colgroup><col style="width:50%"><col style="width:50%"></colgroup>
            <thead><tr>
              <th style="background:#2b6cb0;color:#fff;padding:4px 6px;font-size:10px;text-align:left">◀ 안전 · 구조물 (${leftSecs.reduce((a,si)=>a+INSP_CHECKLIST[si].items.length,0)}항목)</th>
              <th style="background:#276749;color:#fff;padding:4px 6px;font-size:10px;text-align:left">◀ 전기 · 한전 · 마감 (${rightSecs.reduce((a,si)=>a+INSP_CHECKLIST[si].items.length,0)}항목)</th>
            </tr></thead>
            <tbody>
              <tr style="vertical-align:top">
                <td style="padding:0;border-right:2px solid #bbb"><table style="width:100%;border-collapse:collapse"><tbody>${leftRows}</tbody></table></td>
                <td style="padding:0"><table style="width:100%;border-collapse:collapse"><tbody>${rightRows}</tbody></table></td>
              </tr>
            </tbody>
          </table>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div style="border:1px solid #bbb;border-radius:4px;padding:6px 10px;background:#f9f9f9;font-size:10.5px"><strong>점검결과 요약</strong> &nbsp; 총 ${total}항목 중 ${done}항목 완료 (${pct}%) · 불량 ${failCount}건</div>
            <table style="width:100%;border-collapse:collapse;font-size:10.5px"><tr><th style="${th};text-align:center">점검자</th><td style="${td};height:32px"></td><th style="${th};text-align:center">담당자</th><td style="${td}"></td><th style="${th};text-align:center">관리자</th><td style="${td}"></td></tr></table>
          </div>
        </div>`;
      }
      function printInspectionReport(){
        const draft=readInspDraft();
        if(!draft){toast("인쇄할 검수 데이터가 없습니다.");return}
        _doPrint(renderInspectionA4(draft),"PDF 저장");
      }
      function renderInspectionTab(){
        const draft=readInspDraft();
        return draft?renderInspectionFormView(draft):renderInspectionListView();
      }
      function renderReportView(){
        injectReportChrome();
        const driveUrl=localStorage.getItem(DRIVE_FOLDER_KEY)||"";
        const toolbarHtml=`<div class="report-toolbar-row"><button class="report-focus-btn" id="reportFocusModeBtn">📄 집중 모드</button><button class="report-drive-save-btn" id="reportDriveSaveBtn" title="현재 보고서를 구글 드라이브에 HTML 파일로 저장합니다">☁️ Drive 저장</button><button class="report-drive-btn" id="reportDriveFolderBtn" title="${driveUrl?"클릭: Drive 열기 / Shift+클릭: URL 변경":"구글 드라이브 폴더 URL을 설정합니다"}">📁 ${driveUrl?"Drive 열기":"Drive 설정"}</button></div>`;
        els.reportView.innerHTML=`${toolbarHtml}<div class="report-tabs">${reportTabs.map(t=>`<button class="${reportTab===t?"active":""}" data-report-tab="${esc(t)}">${esc(t)}</button>`).join("")}</div>${reportTab==="A/S"?`<div class="report-shell"><aside>${renderReportForm()}</aside><section class="report-preview">${renderAsSheet()}</section></div>`:reportTab==="시공월별보고서"?`<div class="monthly-report-shell"><aside>${renderMonthlyReportForm()}</aside><section class="report-preview">${renderMonthlyReportSheet()}</section></div>`:reportTab==="기타"?`<div class="report-shell"><aside>${renderGenericReportForm()}</aside><section class="report-preview">${renderGenericSheet()}</section></div>`:reportTab==="시공검수"?renderInspectionTab():`<div class="report-card report-placeholder"><div><h2>${esc(reportTab)}</h2><p>양식 준비 영역입니다.</p></div></div>`}`;
        if(reportTab==="A/S")restoreAsDraft();
        if(reportTab==="기타")restoreGenericDraft();
        if(reportTab==="A/S")$$(`#reportView input,#reportView textarea`).forEach(el=>el.addEventListener("input",()=>{saveAsDraft();$(".report-preview").innerHTML=renderAsSheet()}));
        if(reportTab==="기타")$$(`#reportView input,#reportView textarea,#reportView select`).forEach(el=>el.addEventListener("input",refreshGenericReport));
        if(reportTab==="시공월별보고서")$$(`#reportView input`).forEach(el=>el.addEventListener("input",refreshMonthlyReport));
        $("#asBeforeInput")?.addEventListener("change",e=>{readPhotos([...e.target.files].filter(f=>f.type.startsWith("image/")),"before",true);e.target.value=""});
        $("#asAfterInput")?.addEventListener("change",e=>{readPhotos([...e.target.files].filter(f=>f.type.startsWith("image/")),"after",true);e.target.value=""});
        $("#genericPhotoInput")?.addEventListener("change",e=>{addGenericPhotos(e.target.files);e.target.value=""});
        $("#genericPhotoDrop")?.addEventListener("dragover",e=>{e.preventDefault();$("#genericPhotoDrop")?.classList.add("dragover")});
        $("#genericPhotoDrop")?.addEventListener("dragleave",()=>$("#genericPhotoDrop")?.classList.remove("dragover"));
        $("#genericPhotoDrop")?.addEventListener("drop",e=>{e.preventDefault();$("#genericPhotoDrop")?.classList.remove("dragover");addGenericPhotos(e.dataTransfer.files)});
        $("#asDbSearch")?.addEventListener("input",renderAsDbResults);
        $$("#reportView [data-photo-drop]").forEach(zone=>{
          zone.addEventListener("click",()=>$("#"+(zone.dataset.photoDrop==="before"?"asBeforeInput":"asAfterInput"))?.click());
          zone.addEventListener("dragover",e=>{e.preventDefault();e.stopPropagation();$("#asPhotoDropBoard")?.classList.add("dragging");zone.classList.add("dragover");e.dataTransfer.dropEffect="copy"});
          zone.addEventListener("dragleave",()=>{$("#asPhotoDropBoard")?.classList.remove("dragging");zone.classList.remove("dragover")});
          zone.addEventListener("drop",e=>{
            e.preventDefault();e.stopPropagation();$("#asPhotoDropBoard")?.classList.remove("dragging");zone.classList.remove("dragover");
            readPhotos([...e.dataTransfer.files].filter(f=>f.type.startsWith("image/")),zone.dataset.photoDrop,true);
          });
        });
        updatePhotoCounts();
        if(reportTab==="시공검수"){
          function _inspGetDraft(){
            const d=readInspDraft()||{date:today,site:"",company:"",phase:"",inspector:loginName()||"",capacity:"",installType:"",checks:{},sectionMemos:{}};
            d.site=$("#inspSite")?.value??d.site;d.phase=$("#inspPhase")?.value??d.phase;d.company=$("#inspCompany")?.value??d.company;
            d.inspector=$("#inspInspector")?.value??d.inspector;d.date=$("#inspDate")?.value??d.date;
            d.capacity=$("#inspCapacity")?.value??d.capacity;d.installType=$("#inspInstallType")?.value??d.installType;
            return d;
          }
          function _inspAutoSave(){const d=_inspGetDraft();saveInspDraft(d);const {done,total,pct}=inspProgress(d);const bar=$("#reportView .insp-progress-bar");if(bar)bar.style.width=pct+"%";const lbl=$("#reportView .insp-progress-label");if(lbl)lbl.textContent=`${done} / ${total} 항목 완료 (${pct}%)`}
          document.querySelectorAll("#reportView .insp-btn").forEach(btn=>{
            btn.addEventListener("click",()=>{
              const key=btn.dataset.inspKey,val=btn.dataset.v,d=_inspGetDraft();
              if(!d.checks)d.checks={};
              d.checks[key]=d.checks[key]===val?"":val;
              saveInspDraft(d);
              const row=btn.closest(".insp-btns");
              row.querySelectorAll(".insp-btn").forEach(b=>b.classList.toggle("sel",b.dataset.v===d.checks[key]));
              _inspAutoSave();
            });
          });
          document.querySelectorAll("#reportView .insp-memo").forEach(inp=>{
            inp.addEventListener("input",()=>{const d=_inspGetDraft();if(!d.sectionMemos)d.sectionMemos={};d.sectionMemos[inp.dataset.inspMemo]=inp.value;saveInspDraft(d)});
          });
          document.querySelectorAll("#reportView #inspSite,#reportView #inspPhase,#reportView #inspCompany,#reportView #inspInspector,#reportView #inspDate,#reportView #inspCapacity,#reportView #inspInstallType").forEach(el=>{el.addEventListener("input",()=>saveInspDraft(_inspGetDraft()))});
          $("#inspSaveBtn")?.addEventListener("click",()=>{
            if(!state.siteInspections)state.siteInspections=[];
            const d=_inspGetDraft();d.savedAt=new Date().toISOString();
            state.siteInspections.push(d);
            clearInspDraft();deleteAndSync("시공검수를 저장했습니다.");renderReportView();
          });
          $("#inspPrintBtn")?.addEventListener("click",()=>{saveInspDraft(_inspGetDraft());printInspectionReport()});
          $("#inspBackBtn")?.addEventListener("click",()=>{if(confirm("작성 중인 내용은 임시저장됩니다. 목록으로 이동할까요?")){saveInspDraft(_inspGetDraft());renderReportView()}});
          $("#inspNewBtn")?.addEventListener("click",()=>{saveInspDraft({date:today,site:"",company:"",phase:"",inspector:loginName()||"",capacity:"",installType:"",checks:{},sectionMemos:{}});renderReportView()});
          document.querySelectorAll("#reportView [data-insp-load]").forEach(el=>{el.addEventListener("click",()=>{const i=Number(el.dataset.inspLoad),d=state.siteInspections[i];if(d){saveInspDraft(JSON.parse(JSON.stringify(d)));renderReportView()}})});
          document.querySelectorAll("#reportView [data-insp-delete]").forEach(el=>{el.addEventListener("click",e=>{e.stopPropagation();const i=Number(el.dataset.inspDelete);if(confirm("이 검수 기록을 삭제할까요?")){if(!state.siteInspections)state.siteInspections=[];state.siteInspections.splice(i,1);deleteAndSync("검수 기록을 삭제했습니다.");renderReportView()}})});
          function _renderInspDbResults(){
            const box=$("#inspDbResults"),q=$("#inspDbSearch")?.value||"";
            if(!box||!window.solarDb)return;
            const rows=window.solarDb.search(q,12);
            box.classList.toggle("hidden",!q.trim());
            const c=window.solarDb.cell;
            window.__inspDbMatches=rows;
            box.innerHTML=rows.length?
              `<div style="padding:6px 10px;background:#f0f9f4;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;align-items:center;gap:8px"><span style="font-size:12px;color:#555">체크 후 취합 선택</span><button class="btn primary" type="button" id="inspDbMergeBtn" style="padding:4px 10px;font-size:12px;flex-shrink:0">선택 취합</button></div>`+
              rows.map((x,i)=>{
                const site=c(x.row,["발전소명","현장명","사업장명","발전소"])||"";
                const kw=String(c(x.row,["공사용량","발전허가용량","용량(kW)","용량","설비용량"])||"").replace(/[^\d.]/g,"");
                const customer=c(x.row,["사업주","사업주명","대표자","고객명","성명"])||"";
                const sub=[customer,kw?kw+"kW":""].filter(Boolean).join(" · ");
                return`<label style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #eee;cursor:pointer"><input type="checkbox" data-insp-db-check="${i}" style="flex-shrink:0"><span style="flex:1"><strong>${esc(site||"DB 항목")}</strong>${sub?`<small style="display:block;color:#888;font-size:11px">${esc(sub)}</small>`:""}</span><button class="btn" type="button" data-insp-db-row="${x.i}" style="padding:4px 8px;font-size:12px;flex-shrink:0">단일</button></label>`;
              }).join("")
              :q.trim()?`<div style="padding:8px;color:#888;font-size:13px">검색 결과가 없습니다.</div>`:"";
          }
          document.querySelector("#reportView #inspDbSearch")?.addEventListener("input",_renderInspDbResults);
          document.querySelector("#reportView")?.addEventListener("click",function(e){
            if(e.target.closest("#inspDbMergeBtn")){
              const checked=[...document.querySelectorAll("[data-insp-db-check]:checked")].map(el=>window.__inspDbMatches?.[Number(el.dataset.inspDbCheck)]).filter(Boolean);
              if(!checked.length){toast("먼저 호기를 체크해주세요.");return}
              const rows=checked.map(x=>window.solarDb?.rows()[x.i]).filter(Boolean);
              const c=window.solarDb.cell;
              const sites=rows.map(r=>c(r,["발전소명","현장명","사업장명","발전소"])||"").filter(Boolean);
              const totalKw=Math.round(rows.reduce((s,r)=>s+Number(String(c(r,["공사용량","발전허가용량","용량(kW)","용량","설비용량"])||"").replace(/[^\d.]/g,"")||0),0)*100)/100;
              const company=c(rows[0],["시공업체","시공_전기시공업체","전기시공업체","시공사"])||"";
              const installType=c(rows[0],["설치형태","설치유형","지붕유형"])||"";
              const label=sites.length>1?`${sites[0]} 외 ${sites.length-1}건`:sites[0]||"";
              if(label&&$("#inspSite"))$("#inspSite").value=label;
              if(totalKw&&$("#inspCapacity"))$("#inspCapacity").value=String(totalKw);
              if(company&&$("#inspCompany"))$("#inspCompany").value=company;
              if(installType&&$("#inspInstallType"))$("#inspInstallType").value=installType;
              saveInspDraft(_inspGetDraft());
              $("#inspDbResults")?.classList.add("hidden");
              if($("#inspDbSearch"))$("#inspDbSearch").value=label||"";
              toast(`${checked.length}개 호기를 취합했습니다.`);
              return;
            }
            const t=e.target.closest("[data-insp-db-row]");
            if(!t)return;
            const row=window.solarDb?.rows()[Number(t.dataset.inspDbRow)];if(!row)return;
            const c=window.solarDb.cell;
            const site=c(row,["발전소명","현장명","사업장명","발전소"]);
            const kw=String(c(row,["공사용량","발전허가용량","용량(kW)","용량","설비용량"])||"").replace(/[^\d.]/g,"");
            const company=c(row,["시공업체","시공_전기시공업체","전기시공업체","시공사"]);
            const installType=c(row,["설치형태","설치유형","지붕유형","설치타입"]);
            if(site&&$("#inspSite"))$("#inspSite").value=site;
            if(kw&&$("#inspCapacity"))$("#inspCapacity").value=kw;
            if(company&&$("#inspCompany"))$("#inspCompany").value=company;
            if(installType&&$("#inspInstallType"))$("#inspInstallType").value=installType;
            saveInspDraft(_inspGetDraft());
            $("#inspDbResults")?.classList.add("hidden");
            if($("#inspDbSearch"))$("#inspDbSearch").value=site||"";
            toast("DB 정보를 자동 입력했습니다.");
          });
        }
      }
      function renderAsDbResults(){
        const box=$("#asDbResults"),q=$("#asDbSearch")?.value||"";
        if(!box||!window.solarDb)return;
        const rows=window.solarDb.search(q,6);
        box.innerHTML=rows.length?rows.map(x=>`<button class="report-db-result" type="button" data-as-db-row="${x.i}"><strong>${esc(window.solarDb.summary(x.row)||"DB 항목")}</strong></button>`).join(""):(q.trim()?`<div class="meta">검색 결과가 없습니다.</div>`:"");
      }
      function setReportField(id,value){const el=$("#"+id);if(el&&value!==undefined&&value!==null&&String(value).trim()!==""){el.value=String(value).trim()}}
      function applyDbRowToAs(row){
        const c=window.solarDb?.cell;if(!c)return;
        setReportField("asSite",c(row,["발전소명","현장명","사업장명","발전소","상호"]));
        setReportField("asClient",c(row,["사업주","사업주명","대표자","고객명","발주처","성명"]));
        setReportField("asPhone",c(row,["연락처","전화번호","휴대폰","핸드폰","사업주연락처"]));
        setReportField("asAddress",c(row,["현장주소","현장 주소","주소","설치주소","소재지"]));
        setReportField("asKw",c(row,["공사용량","발전허가용량","용량(kW)","용량","설비용량","kw","kW"]));
        setReportField("asRoof",c(row,["건립종류","지붕유형","지붕형태","설치유형","구조물"]));
        setReportField("asBuilt",c(row,["상업운전개시일","시공년월","준공일","사용전검사일","설치일"]));
        setReportField("asDefectType",c(row,["AS분류","A/S분류"]));
        setReportField("asCause",c(row,["AS원인","A/S원인"]));
        setReportField("asFinish",c(row,["AS처리여부","A/S처리여부"]));
        setReportField("asCompleted",c(row,["AS완료일자","A/S완료일자"]));
        saveAsDraft();
        $(".report-preview").innerHTML=renderAsSheet();
        $("#asDbResults").innerHTML="";
        toast("DB 정보로 보고서를 자동 입력했습니다.");
      }
      function readPhotos(files,kind,append=false){
        const current=kind==="before"?beforePhotos:afterPhotos;
        const remaining=Math.max(0,3-(append?current.length:0));
        const picked=[...files].slice(0,append?remaining:3);
        if(!picked.length){toast("사진은 최대 3장까지 넣을 수 있습니다.");return}
        Promise.all(picked.map(file=>new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(file)}))).then(urls=>{
          if(kind==="before")beforePhotos=(append?[...beforePhotos,...urls]:urls).slice(0,3);
          else afterPhotos=(append?[...afterPhotos,...urls]:urls).slice(0,3);
          $(".report-preview").innerHTML=renderAsSheet();updatePhotoCounts();toast(`${kind==="before"?"작업 전":"작업 후"} 사진 ${urls.length}장을 넣었습니다.`);
        });
      }
      function _doPrint(html,buttonLabel){
        const button=$("#addProjectBtn");
        if(button){button.classList.add("report-printing");button.textContent="준비 중"}
        const reportCss=($("#reportStyle")?.textContent||"").replace(/<\/?style[^>]*>/g,"");
        const fullHtml=`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@page{size:A4 portrait;margin:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box}body{margin:0;padding:6mm 8mm;font-family:'Malgun Gothic','Noto Sans KR',Arial,sans-serif;background:#fff;color:#111}${reportCss}</style></head><body>${html}<script>window.addEventListener('load',function(){setTimeout(function(){window.print()},350)});<\/script></body></html>`;
        const blob=new Blob([fullHtml],{type:"text/html;charset=utf-8"});
        const url=URL.createObjectURL(blob);
        window.open(url,"_blank");
        setTimeout(()=>URL.revokeObjectURL(url),60000);
        if(button){setTimeout(()=>{button.classList.remove("report-printing");button.textContent=buttonLabel},800)}
      }
      async function saveReportToDrive(){
        if(!window.driveApi){toast("Drive 연동 모듈이 없습니다.");return}
        const driveConfig=JSON.parse(localStorage.getItem("solar-google-drive-config-v1")||"{}");
        if(!driveConfig.clientId){toast("프로젝트 파일 탭에서 먼저 Drive Client ID를 설정해주세요.");return}
        toast("Drive 연결 중...");
        const ok=await window.driveApi.ensureToken();
        if(!ok){toast("Drive 연결에 실패했습니다.");return}
        let reportHtml="";
        if(reportTab==="A/S")reportHtml=renderAsSheet();
        else if(reportTab==="시공월별보고서")reportHtml=renderMonthlyReportSheet();
        else if(reportTab==="기타")reportHtml=renderGenericSheet();
        else{toast("저장할 보고서를 선택하세요.");return}
        const styleEl=document.getElementById("reportStyle");
        const styles=styleEl?styleEl.textContent:"";
        const fullHtml=`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${reportTab} 보고서 ${today}</title><style>body{margin:0;padding:20px;background:#fff;font-family:"Malgun Gothic","Noto Sans KR",Arial,sans-serif}${styles}</style></head><body>${reportHtml}</body></html>`;
        const name=`보고서_${reportTab}_${today}.html`;
        toast("Drive에 저장 중...");
        try{
          const blob=new Blob([fullHtml],{type:"text/html"});
          const file=await window.driveApi.uploadFile(name,blob);
          toast(`✓ Drive에 저장했습니다: ${name}`);
          if(file.webViewLink){
            setTimeout(()=>{
              if(confirm(`Drive 저장 완료!\n\n${name}\n\n지금 Drive에서 열어볼까요?`))window.open(file.webViewLink,"_blank");
            },300);
          }
        }catch(err){toast("Drive 저장 실패: "+(err.message||String(err)));console.warn(err)}
      }
      function printAsReport(){_doPrint(renderAsSheet(),"보고서 인쇄")}
      function printMonthlyReport(){_doPrint(renderMonthlyReportSheet(),"A4 출력")}
      document.addEventListener("click",e=>{
        const t=e.target.closest("button")||e.target;
        if(currentView==="reports"&&t.id==="addProjectBtn"){e.preventDefault();e.stopImmediatePropagation();if(reportTab==="A/S")printAsReport();else if(reportTab==="시공월별보고서")printMonthlyReport();else if(reportTab==="기타")printGenericReport();else if(reportTab==="시공검수")printInspectionReport();else toast(`${reportTab} 양식은 준비 중입니다.`)}
        if(t.id==="saveAsReportBtn"){e.preventDefault();e.stopImmediatePropagation();saveAsDraft();const d={...readAsDraft(),beforePhotos:[...beforePhotos],afterPhotos:[...afterPhotos],savedAt:new Date().toISOString()};if(!state.asReports)state.asReports=[];state.asReports.push(d);saveState("A/S 보고서를 저장했습니다.");renderReportView()}
        if(t.id==="saveMonthlyReportBtn"){e.preventDefault();e.stopImmediatePropagation();saveMonthlySettings();const tot=monthlyTotals();const d={ym:selectedReportMonth(),count:tot.count,totalKw:Math.round(tot.kw*100)/100,settings:{...monthlyReportSettings()},savedAt:new Date().toISOString()};if(!state.monthlyReports)state.monthlyReports=[];state.monthlyReports.push(d);saveState("월별보고서를 저장했습니다.");renderReportView()}
        if(t.id==="saveGenericReportBtn"){e.preventDefault();e.stopImmediatePropagation();saveGenericDraft();const d={...readGenericDraft(),photos:[...genericPhotos],savedAt:new Date().toISOString()};if(!state.genericReports)state.genericReports=[];state.genericReports.push(d);saveState("보고서를 저장했습니다.");renderReportView()}
        if(t.dataset.histLoadAS!==undefined){const r=state.asReports?.[Number(t.dataset.histLoadAS)];if(r){asFieldIds.forEach(id=>{const el=$("#"+id);if(el&&r[id]!==undefined)el.value=r[id]});beforePhotos=r.beforePhotos||[];afterPhotos=r.afterPhotos||[];saveAsDraft();$(".report-preview").innerHTML=renderAsSheet();updatePhotoCounts();toast("불러왔습니다.")}return}
        if(t.dataset.histDelAS!==undefined){const i=Number(t.dataset.histDelAS);if(confirm("이 저장 기록을 삭제할까요?")){state.asReports?.splice(i,1);saveState("삭제했습니다.");renderReportView()}return}
        if(t.dataset.histLoad월별!==undefined){const r=state.monthlyReports?.[Number(t.dataset["histLoad월별"])];if(r&&r.settings){Object.entries(r.settings).forEach(([k,v])=>{const el=$("#monthly"+k.charAt(0).toUpperCase()+k.slice(1));if(el)el.value=v});const mon=$("#monthlyReportMonth");if(mon)mon.value=r.ym||mon.value;saveMonthlySettings();$(".report-preview").innerHTML=renderMonthlyReportSheet();toast("불러왔습니다.")}return}
        if(t.dataset.histDel월별!==undefined){const i=Number(t.dataset["histDel월별"]);if(confirm("이 저장 기록을 삭제할까요?")){state.monthlyReports?.splice(i,1);saveState("삭제했습니다.");renderReportView()}return}
        if(t.dataset.histLoad기타!==undefined){const r=state.genericReports?.[Number(t.dataset.histLoad기타)];if(r){genericFieldIds.forEach(id=>{const el=$("#"+id);if(el&&r[id]!==undefined)el.value=r[id]});genericPhotos=r.photos||[];refreshGenericReport();renderReportView();toast("불러왔습니다.")}return}
        if(t.dataset.histDel기타!==undefined){const i=Number(t.dataset.histDel기타);if(confirm("이 저장 기록을 삭제할까요?")){state.genericReports?.splice(i,1);saveState("삭제했습니다.");renderReportView()}return}
        if(t.id==="reportFocusModeBtn"){e.preventDefault();e.stopImmediatePropagation();enterReportFocusMode()}
        if(t.id==="reportDriveSaveBtn"){e.preventDefault();e.stopImmediatePropagation();saveReportToDrive()}
        if(t.id==="reportDriveFolderBtn"){e.preventDefault();e.stopImmediatePropagation();const saved=localStorage.getItem(DRIVE_FOLDER_KEY)||"";if(saved&&!e.shiftKey){window.open(saved,"_blank")}else{openDriveFolder();renderReportView()}}
        if(t.dataset.reportTab){reportTab=t.dataset.reportTab;syncViewChrome();renderReportView()}
        if(t.dataset.asDbRow!==undefined){const row=window.solarDb?.rows()[Number(t.dataset.asDbRow)];if(row)applyDbRowToAs(row)}
        if(t.dataset.printAsReport!==undefined)printAsReport();
        if(t.id==="printMonthlyReportBtn"){e.preventDefault();e.stopImmediatePropagation();printMonthlyReport()}if(t.id==="printGenericReportBtn"){e.preventDefault();e.stopImmediatePropagation();printGenericReport()}if(t.id==="genericPhotoDrop"){e.preventDefault();e.stopImmediatePropagation();$("#genericPhotoInput")?.click()}if(t.id==="clearGenericPhotosBtn"){e.preventDefault();e.stopImmediatePropagation();genericPhotos=[];renderReportView();toast("첨부 사진을 비웠습니다.")}
      },true);
      if(localStorage.getItem(viewStorageKey)==="reports")currentView="reports";
      injectReportChrome();
    })();
    (function setupCategoryPolish(){
      const extendedViews=new Set(["drive","reports","db","fieldwork"]);
      if(!$("#categoryPolishStyle")){
        document.head.insertAdjacentHTML("beforeend",`<style id="categoryPolishStyle">
          header{position:relative;overflow:hidden;border-radius:10px;padding:12px 14px;margin:-8px -14px 18px}
          header:before{content:"";position:absolute;inset:0;border-radius:10px;background:linear-gradient(90deg,#eaf8f6,#f8fbfd 62%,transparent);opacity:.82;z-index:-1}
          body.view-dashboard header:before{background:linear-gradient(90deg,#e9f7ff,#f8fbfd 62%,transparent)}
          body.view-construction header:before{background:linear-gradient(90deg,#eef7f1,#f8fbfd 62%,transparent)}
          body.view-todos header:before{background:linear-gradient(90deg,#fff7df,#f8fbfd 62%,transparent)}
          body.view-assignments header:before{background:linear-gradient(90deg,#f1ecff,#f8fbfd 62%,transparent)}
          body.view-drive header:before{background:linear-gradient(90deg,#eaf2ff,#f8fbfd 62%,transparent)}
          body.view-reports header:before{background:linear-gradient(90deg,#fff0e8,#f8fbfd 62%,transparent)}
          body.view-db header:before{background:linear-gradient(90deg,#e9f8ef,#f8fbfd 62%,transparent)}
          body.view-fieldwork header:before{background:linear-gradient(90deg,#eaf8f6,#f8fbfd 62%,transparent)}
          body.view-admin header:before{background:linear-gradient(90deg,#f0f3f7,#f8fbfd 62%,transparent)}
          header h1{letter-spacing:0}
        #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
      }
      function applyCategoryChrome(){
        document.body.className=document.body.className.replace(/\bview-\S+/g,"").trim();
        document.body.classList.add(`view-${currentView}`);
        if(extendedViews.has(currentView)){
          $("#kpis")?.classList.add("hidden");
          els.dashboardView?.classList.add("hidden");
          els.adminView?.classList.add("hidden");
          els.mainGrid?.classList.add("hidden");
          if(els.driveView)els.driveView.classList.toggle("hidden",currentView!=="drive");
          if(els.reportView)els.reportView.classList.toggle("hidden",currentView!=="reports");
          if(els.dbView)els.dbView.classList.toggle("hidden",currentView!=="db");
          $("#sharedNotice")?.classList.add("hidden");
        }else{
          $("#sharedNotice")?.classList.remove("hidden");
          if(els.driveView)els.driveView.classList.add("hidden");
          if(els.reportView)els.reportView.classList.add("hidden");
          if(els.dbView)els.dbView.classList.add("hidden");
        }
      }
      const baseSyncForPolish=syncViewChrome;
      syncViewChrome=function(){baseSyncForPolish();applyCategoryChrome()};
      const baseRenderViewForPolish=renderView;
      renderView=function(){baseRenderViewForPolish();applyCategoryChrome()};
      const baseGoToViewForPolish=goToView;
      goToView=function(view,label=""){baseGoToViewForPolish(view,label);applyCategoryChrome()};
      applyCategoryChrome();
    })();
    (function setupConstructionDbSearch(){
      if(!$("#constructionDbStyle")){
        document.head.insertAdjacentHTML("beforeend",`<style id="constructionDbStyle">
          #constructionModal .modal-head{align-items:flex-start;gap:10px}
          .construction-db-search{position:relative;margin-left:auto;width:min(430px,52vw)}
          .construction-db-search .field{width:100%;height:36px}
          .construction-db-results{position:absolute;top:40px;left:0;right:0;z-index:30;display:grid;gap:6px;max-height:320px;overflow:auto;background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:8px}
          .construction-db-pickbar{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:8px;background:#f7fbff;border:1px solid #cfe5ee;border-radius:8px;padding:7px 8px;font-size:12px;font-weight:900}
          .construction-db-result{display:grid;grid-template-columns:24px 1fr auto;align-items:center;gap:7px;border:1px solid var(--line);background:#fbfdfe;border-radius:8px;padding:8px;text-align:left;font-size:12px;line-height:1.45}
          .construction-db-result input{width:16px;height:16px}
          .construction-db-apply-one{padding:5px 8px;min-height:28px}
          .construction-db-result small{display:block;margin-top:3px;color:var(--muted);font-weight:700}
          .construction-db-empty{font-size:12px;color:var(--muted);padding:8px}
          @media(max-width:720px){#constructionModal .modal-head{display:grid;grid-template-columns:1fr auto}.construction-db-search{grid-column:1/-1;width:100%;margin-left:0;order:3}}
        #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
      }
      function ensureConstructionDbSearch(){
        const head=$("#constructionModal .modal-head");
        if(!head||$("#constructionDbSearch"))return;
        const close=head.querySelector("[data-close='constructionModal']");
        close?.insertAdjacentHTML("beforebegin",`<div class="construction-db-search"><input class="field" id="constructionDbSearch" placeholder="DB 검색"><div class="construction-db-results hidden" id="constructionDbResults"></div></div>`);
      }
      const baseOpenConstructionForDb=openConstructionModal;
      openConstructionModal=function(...args){baseOpenConstructionForDb(...args);ensureConstructionDbSearch();$("#constructionDbSearch").value="";$("#constructionDbResults").classList.add("hidden");if(!$("#constructionAddress").value&&window.solarDb){const site=$("#constructionSite")?.value;if(site){const m=window.solarDb.search(site,1);if(m.length){const info=dbRowInfo(m[0].row,m[0].i);if(info.address)$("#constructionAddress").value=info.address}}}};
      function renderConstructionDbResults(){
        const box=$("#constructionDbResults"),q=$("#constructionDbSearch")?.value||"";
        if(!box||!window.solarDb)return;
        const rows=window.solarDb.search(q,12);
        window.__constructionDbMatches=rows;
        box.classList.toggle("hidden",!q.trim());
        box.innerHTML=rows.length?`<div class="construction-db-pickbar"><span>체크한 호기를 한 시공일정으로 취합</span><button class="btn primary" type="button" id="applySelectedConstructionDbRows">선택 호기 취합</button></div>`+rows.map((x,i)=>{const info=dbRowInfo(x.row,x.i),sub=[info.customer,info.address].filter(Boolean).join(" · ");return `<label class="construction-db-result"><input type="checkbox" data-construction-db-check="${i}"><span><strong>${esc(info.site)}${info.kw?` · ${esc(info.kw)}kW`:""}</strong>${sub?`<small>${esc(sub)}</small>`:""}</span><button class="btn construction-db-apply-one" type="button" data-construction-db-row="${x.i}">단일 입력</button></label>`}).join(""):`<div class="construction-db-empty">검색 결과가 없습니다.</div>`;
      }
      function setSelectIfExists(id,value){
        const el=$("#"+id);if(!el||!value)return false;
        const opt=[...el.options].find(o=>o.value===value||o.textContent===value);
        if(opt){el.value=opt.value;return true}
        return false;
      }
      function normalizedDbText(v){return String(v||"").replace(/\s+/g,"").toLowerCase()}
      function dbRowInfo(row,i){
        const c=window.solarDb?.cell;
        const site=c(row,["발전소명","현장명","사업장명","발전소"])||"DB 항목";
        const kw=Number(String(c(row,["공사용량","발전허가용량","공사_용량","발전_허가용량","용량(kW)","용량","설비용량"])||"").replace(/[^\d.]/g,""))||0;
        const customer=c(row,["사업주","사업주명","대표자","고객명","성명"]);
        const address=c(row,["현장주소","현장 주소","주소","설치주소","소재지"]);
        return {row,i,site,kw,customer,address,sales:c(row,["영업담당자","영업 담당자","영업자","담당자"]),status:c(row,["진행상태","진행중","상태","공사진행"]),request:c(row,["고객요청사항","요청사항","비고"]),company:c(row,["시공업체","시공_전기시공업체","전기시공업체","시공사"]),structureTeam:c(row,["구조물시공팀","시공_구조물시공팀","구조물팀"])};
      }
      function basePlantName(name){return String(name||"").replace(/\s*\d+\s*호?\s*$/,"").trim()||String(name||"").trim()}
      function groupLabel(items){const first=items[0]||{},base=basePlantName(first.site);return items.length>1?`${base} ${items.length}기`:first.site}
      function selectedConstructionDbItems(){return [...document.querySelectorAll("[data-construction-db-check]:checked")].map(el=>window.__constructionDbMatches?.[Number(el.dataset.constructionDbCheck)]).filter(Boolean).map(x=>dbRowInfo(x.row,x.i))}
      function applyDbRowToConstruction(row){
        const c=window.solarDb?.cell;if(!c)return;
        const site=c(row,["발전소명","현장명","사업장명","발전소"]);
        const kw=c(row,["공사용량","발전허가용량","공사_용량","발전_허가용량","용량(kW)","용량","설비용량"]);
        const sales=c(row,["영업담당자","영업 담당자","영업자","담당자"]);
        const customer=c(row,["사업주","사업주명","대표자","고객명","성명"]);
        const address=c(row,["현장주소","현장 주소","주소","설치주소","소재지"]);
        const status=c(row,["진행상태","진행중","상태","공사진행"]);
        const request=c(row,["고객요청사항","요청사항","비고"]);
        const company=c(row,["시공업체","시공_전기시공업체","전기시공업체","시공사"]);
        const structureTeam=c(row,["구조물시공팀","시공_구조물시공팀","구조물팀"]);
        if(site)$("#constructionSite").value=site;
        if(kw)$("#constructionKw").value=String(kw).replace(/[^\d.]/g,"");
        if(sales)$("#constructionSales").value=sales;
        if(customer)$("#constructionCustomer").value=customer;
        if(company)setSelectIfExists("constructionCompany",company);
        if(structureTeam)setSelectIfExists("constructionStructureTeam",structureTeam);
        if(address)$("#constructionAddress").value=address;
        const next=[status&&`진행상태: ${status}`,request&&`요청사항: ${request}`].filter(Boolean).join("\n");
        if(next)$("#constructionNext").value=next;
        $("#constructionDbResults")?.classList.add("hidden");
        $(".construction-db-search #constructionDbSearch").value=site||customer||"";
        updateConstructionDuration();
        toast("DB 정보로 시공일정을 자동 입력했습니다.");
      }
      function applyDbGroupToConstruction(group){
        const items=group?.items||[];if(!items.length)return;
        const first=items[0],sites=[...new Set(items.map(x=>x.site).filter(Boolean))],requests=[...new Set(items.map(x=>x.request).filter(Boolean))],statuses=[...new Set(items.map(x=>x.status).filter(Boolean))];
        $("#constructionSite").value=group.label||groupLabel(items);
        $("#constructionKw").value=String(group.kw||"");
        if(first.sales)$("#constructionSales").value=first.sales;
        if(first.customer)$("#constructionCustomer").value=first.customer;
        if(first.company)setSelectIfExists("constructionCompany",first.company);
        if(first.structureTeam)setSelectIfExists("constructionStructureTeam",first.structureTeam);
        if(first.address)$("#constructionAddress").value=first.address;
        const next=[sites.length>1&&`포함 호기: ${sites.join(", ")}`,statuses.length&&`진행상태: ${statuses.join(", ")}`,requests.length&&`요청사항: ${requests.join(" / ")}`].filter(Boolean).join("\n");
        if(next)$("#constructionNext").value=next;
        $("#constructionDbResults")?.classList.add("hidden");
        $(".construction-db-search #constructionDbSearch").value=group.label||groupLabel(items);
        updateConstructionDuration();
        toast(items.length>1?`${items.length}개 호기를 한 시공일정으로 자동 입력했습니다.`:"DB 정보로 시공일정을 자동 입력했습니다.");
      }
      function applySelectedDbRowsToConstruction(){
        const items=selectedConstructionDbItems();
        if(!items.length){toast("취합할 호기를 먼저 체크해주세요.");return}
        const label=items.length>1?groupLabel(items):items[0].site,kw=Math.round(items.reduce((s,x)=>s+x.kw,0)*100)/100;
        applyDbGroupToConstruction({items,label,kw});
      }
      document.addEventListener("input",e=>{if(e.target?.id==="constructionDbSearch")renderConstructionDbResults()},true);
      document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.id==="applySelectedConstructionDbRows"){e.preventDefault();e.stopImmediatePropagation();applySelectedDbRowsToConstruction();return}if(t.dataset.constructionDbRow!==undefined){e.preventDefault();e.stopImmediatePropagation();const row=window.solarDb?.rows()[Number(t.dataset.constructionDbRow)];if(row)applyDbRowToConstruction(row)}},true);
    })();
    (function setupFieldworkView(){
      function ensureFieldworkChrome(){
        if(!$("#fieldworkView")){
          (els.dbView||els.reportView||els.driveView||els.adminView).insertAdjacentHTML("afterend",`<section class="panel hidden" id="fieldworkView"></section>`);
          els.fieldworkView=$("#fieldworkView");
        }
        if(!$("#fieldworkStyle")){
          document.head.insertAdjacentHTML("beforeend",`<style id="fieldworkStyle">
            #fieldworkView{box-shadow:none;background:transparent;border:0;padding:0}
            .fieldwork-shell{display:grid;gap:14px}
            .fieldwork-top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
            .fieldwork-kpis{display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:10px}
            .fieldwork-kpi{background:#fff;border:1px solid var(--line);border-radius:8px;padding:13px;box-shadow:var(--shadow)}
            .fieldwork-board{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px}
            .fieldwork-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px;box-shadow:var(--shadow);display:grid;gap:10px}
            .fieldwork-status{display:flex;justify-content:space-between;align-items:center;gap:8px}
            .fieldwork-actions{display:flex;gap:6px;flex-wrap:wrap}
            .fieldwork-actions .btn{min-height:30px;padding:0 9px;font-size:12px}
            .fieldwork-log{background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden}
            .fieldwork-row{display:grid;grid-template-columns:120px 100px minmax(120px,1fr) minmax(120px,1fr) 70px;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line);font-size:13px;align-items:center}
            .fieldwork-row.no-time{grid-template-columns:120px 100px minmax(120px,1fr) minmax(120px,1fr)} .fieldwork-row.admin-delete{grid-template-columns:120px 100px minmax(120px,1fr) minmax(120px,1fr) 70px}
            .fieldwork-row.head{background:#f8fbfc;color:var(--muted);font-weight:900;font-size:12px}
            .fieldwork-row:last-child{border-bottom:0}
            @media(max-width:760px){.fieldwork-kpis{grid-template-columns:repeat(2,1fr)}.fieldwork-row,.fieldwork-row.no-time{grid-template-columns:1fr}.fieldwork-row.head{display:none}}
          #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
        }
      }
      function ensureFieldworkState(){
        if(!Array.isArray(state.fieldworkLogs))state.fieldworkLogs=[];
        state.fieldworkLogs.forEach(x=>{if(!x.id)x.id=uid("fieldwork");if(!x.date&&x.time)x.date=String(x.time).slice(0,10);if(!x.savedAt)x.savedAt=x.time||new Date().toISOString()});
        if(!state.nav.some(n=>n.label==="외근현황")){
          const adminIndex=state.nav.findIndex(n=>n.label.includes("관리자"));
          state.nav.splice(adminIndex>=0?adminIndex:state.nav.length,0,{icon:"⌖",label:"외근현황"});
        }
      }
      const baseNormalizeForFieldwork=normalizeState;
      normalizeState=function(){baseNormalizeForFieldwork();ensureFieldworkState()};
      const baseViewForFieldwork=viewForLabel;
      viewForLabel=function(label){return label.includes("외근현황")||label.includes("외근")?"fieldwork":baseViewForFieldwork(label)};
      const baseIsActiveForFieldwork=isActive;
      isActive=function(label){return currentView==="fieldwork"?label.includes("외근현황"):baseIsActiveForFieldwork(label)};
      const baseRenderViewForFieldwork=renderView;
      renderView=function(){
        baseRenderViewForFieldwork();ensureFieldworkChrome();
        const isField=currentView==="fieldwork";
        $("#kpis")?.classList.toggle("hidden",isField||currentView==="dashboard"||currentView==="assignments"||currentView==="todos");
        els.dashboardView?.classList.toggle("hidden",isField?true:currentView!=="dashboard");
        els.adminView?.classList.toggle("hidden",isField?true:currentView!=="admin");
        els.mainGrid?.classList.toggle("hidden",isField||currentView==="dashboard"||currentView==="admin");
        els.fieldworkView?.classList.toggle("hidden",!isField);
        if(isField){if(els.driveView)els.driveView.classList.add("hidden");if(els.reportView)els.reportView.classList.add("hidden");if(els.dbView)els.dbView.classList.add("hidden")}
        else els.fieldworkView?.classList.add("hidden");
      };
      const baseRenderCurrentForFieldwork=renderCurrentContent;
      renderCurrentContent=function(){if(currentView==="fieldwork"){syncViewChrome();renderFieldworkView();return}baseRenderCurrentForFieldwork()};
      const baseSyncForFieldwork=syncViewChrome;
      syncViewChrome=function(){baseSyncForFieldwork();if(currentView==="fieldwork"){els.pageTitle.textContent="외근현황";els.pageSub.textContent="전국 현장 이동, 출근, 퇴근, 발전소별 작업 상태를 직원별로 확인합니다.";$("#addProjectBtn").textContent=adminUnlocked?"엑셀 내보내기":"현황 등록"}};
      function localFieldworkStamp(){const d=new Date();return `${localDateString(d)} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`}
      function latestFieldworkByPerson(name){return [...(state.fieldworkLogs||[])].reverse().find(x=>x.person===name&&(x.date||String(x.time||"").slice(0,10))===today)}
      function fieldworkStatusClass(status){if(status==="퇴근")return"green";if(status==="출근")return"blue";if(status==="이동중")return"amber";if(status==="현장도착"||status==="작업중")return"red";return""}function fieldworkProgressRank(status){return {"작업중":0,"현장도착":1,"이동중":2,"출근":3,"출근 전":4,"퇴근":5}[status]??6}
      function fieldworkKpis(){const people=state.people||[],latest=people.map(p=>latestFieldworkByPerson(p.name)),count=s=>latest.filter(x=>x?.status===s).length;return {total:people.length,checkin:latest.filter(Boolean).length,move:count("이동중"),work:count("현장도착")+count("작업중"),off:count("퇴근")}}
      function fieldworkWhen(x){return String(x?.time||"").replace("T"," ").slice(0,16)}
      function csvCell(v){return `"${String(v??"").replaceAll('"','""')}"`}
      function exportFieldworkExcel(){
        if(!adminUnlocked&&!unlockAdmin())return;
        const rows=["날짜,시간,직원,상태,발전소/현장,지역,메모"];
        (state.fieldworkLogs||[]).slice().reverse().forEach(x=>{const when=fieldworkWhen(x);rows.push([x.date||when.slice(0,10),when.slice(11,16),x.person,x.status,x.site,x.region,x.memo].map(csvCell).join(","))});
        const blob=new Blob(["\ufeff"+rows.join("\n")],{type:"text/csv;charset=utf-8"});
        const url=URL.createObjectURL(blob),a=document.createElement("a");
        a.href=url;a.download=`외근현황_${today}.csv`;a.click();URL.revokeObjectURL(url);
        toast("외근현황 엑셀 파일을 내보냈습니다.");
      }
      function renderFieldworkView(){
        ensureFieldworkChrome();ensureFieldworkState();
        const canSeeTime=false,k=fieldworkKpis(),logs=(state.fieldworkLogs||[]).filter(x=>(x.date||String(x.time||"").slice(0,10))===today).slice().sort((a,b)=>fieldworkProgressRank(a.status)-fieldworkProgressRank(b.status)||String(b.time||"").localeCompare(String(a.time||"")));
        const cards=(state.people||[]).map((p,i)=>({p,i,latest:latestFieldworkByPerson(p.name)})).map(x=>({...x,status:x.latest?.status||"출근 전"})).sort((a,b)=>fieldworkProgressRank(a.status)-fieldworkProgressRank(b.status)||a.p.name.localeCompare(b.p.name,"ko")).map(({p,i,latest,status})=>{const place=latest?[latest.site||"현장 미입력",latest.region||"지역 미입력",canSeeTime?fieldworkWhen(latest).slice(11,16):""].filter(Boolean).join(" · "):"오늘 기록 없음";return `<div class="fieldwork-card"><div class="fieldwork-status"><div><div class="name">${esc(p.name)}</div><div class="meta">${esc(p.role||"직원")} · ${esc(p.area||"담당업무 미입력")}</div></div><span class="badge ${fieldworkStatusClass(status)}">${esc(status)}</span></div><div class="meta">${esc(place)}</div><div class="fieldwork-actions"><button class="btn" data-fieldwork-status="출근" data-person="${i}">출근</button><button class="btn" data-fieldwork-status="이동중" data-person="${i}">이동중</button><button class="btn" data-fieldwork-status="현장도착" data-person="${i}">현장도착</button><button class="btn" data-fieldwork-status="작업중" data-person="${i}">작업중</button><button class="btn primary" data-fieldwork-status="퇴근" data-person="${i}">퇴근</button></div></div>`}).join("");
        const timeHead=canSeeTime?"<span>시간</span>":"",deleteHead=adminUnlocked?"<span>관리</span>":"";
        const exportBtn=adminUnlocked?`<button class="btn primary" id="fieldworkExportBtn">엑셀 내보내기</button>`:"";
        els.fieldworkView.innerHTML=`<div class="fieldwork-shell"><div class="fieldwork-top"><div class="meta">하루 기록은 날짜별 데이터베이스로 계속 저장됩니다. 시간 데이터는 관리자 엑셀 내보내기에만 포함됩니다.</div><div class="row-actions">${exportBtn}</div></div><div class="fieldwork-kpis"><div class="fieldwork-kpi"><div class="label">등록 직원</div><div class="value">${k.total}</div></div><div class="fieldwork-kpi"><div class="label">오늘 기록</div><div class="value">${k.checkin}</div></div><div class="fieldwork-kpi"><div class="label">이동중</div><div class="value">${k.move}</div></div><div class="fieldwork-kpi"><div class="label">현장 작업</div><div class="value">${k.work}</div></div><div class="fieldwork-kpi"><div class="label">퇴근</div><div class="value">${k.off}</div></div></div><section class="fieldwork-board">${cards||`<div class="dash-empty">직원을 먼저 등록하면 외근 현황을 기록할 수 있습니다.</div>`}</section><section class="fieldwork-log"><div class="fieldwork-row head ${canSeeTime?"":"no-time"}"><span>직원</span><span>상태</span><span>발전소/현장</span><span>지역/메모</span>${timeHead}${deleteHead}</div>${logs.length?logs.map(x=>`<div class="fieldwork-row ${canSeeTime?"":"no-time"} ${adminUnlocked?"admin-delete":""}"><strong>${esc(x.person)}</strong><span><span class="badge ${fieldworkStatusClass(x.status)}">${esc(x.status)}</span></span><span>${esc(x.site||"-")}</span><span>${esc([x.region,x.memo].filter(Boolean).join(" · ")||"-")}</span>${canSeeTime?`<span>${esc(fieldworkWhen(x))}</span>`:""}${adminUnlocked?`<span><button class="btn icon danger" data-delete-fieldwork="${esc(x.id)}">삭제</button></span>`:""}</div>`).join(""):`<div class="fieldwork-row no-time"><span class="meta">오늘 외근 기록이 없습니다.</span></div>`}</section></div>`;
      }
      document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.id==="exportBtn"){if(currentView==="fieldwork"){e.preventDefault();e.stopImmediatePropagation();exportFieldworkExcel();return}if(!adminUnlocked&&!unlockAdmin()){e.preventDefault();e.stopImmediatePropagation();return}}if(currentView==="fieldwork"&&t.id==="addProjectBtn"){e.preventDefault();e.stopImmediatePropagation();if(adminUnlocked)exportFieldworkExcel();else toast("현황은 직원 카드의 상태 버튼으로 기록합니다.")}if(t.id==="fieldworkExportBtn"){e.preventDefault();e.stopImmediatePropagation();exportFieldworkExcel()}if(t.dataset.deleteFieldwork){if(!adminUnlocked&&!unlockAdmin())return;const id=t.dataset.deleteFieldwork;if(confirm("이 외근 기록을 삭제할까요?")){state.fieldworkLogs=(state.fieldworkLogs||[]).filter(x=>x.id!==id);saveState("외근 기록을 삭제했습니다.");render()}return}if(t.dataset.fieldworkStatus){const person=state.people[Number(t.dataset.person)];if(!person)return;const status=t.dataset.fieldworkStatus;let site="",region="",memo="";if(status!=="출근"&&status!=="퇴근"){site=prompt("발전소명 또는 현장명을 입력하세요.",latestFieldworkByPerson(person.name)?.site||"")||"";region=prompt("지역을 입력하세요. 예: 경남 남해",latestFieldworkByPerson(person.name)?.region||"")||""}memo=prompt("메모가 있으면 입력하세요.","")||"";const stamp=localFieldworkStamp();state.fieldworkLogs.unshift({id:uid("fieldwork"),person:person.name,status,site,region,memo,date:stamp.slice(0,10),time:stamp,savedAt:new Date().toISOString()});saveState(`${person.name} ${status} 기록을 저장했습니다.`);render()}},true);
      ensureFieldworkChrome();ensureFieldworkState();
    })();
    (function improveFieldworkWorkflow(){
      const FW={onsite:"현장도착",done:"작업완료",return:"사무실복귀"};
      function ensureFieldworkPanel(){
        if(!$("#fieldworkView")){
          (els.dbView||els.reportView||els.driveView||els.adminView).insertAdjacentHTML("afterend",`<section class="panel hidden" id="fieldworkView"></section>`);
          els.fieldworkView=$("#fieldworkView");
        }
        if(!$("#fieldworkWorkflowStyle")){
          document.head.insertAdjacentHTML("beforeend",`<style id="fieldworkWorkflowStyle">
            .fieldwork-kpis.workflow{grid-template-columns:repeat(5,minmax(110px,1fr))}
            .fieldwork-actions.workflow .btn{min-height:32px}
            .fieldwork-actions.workflow .btn.primary{background:var(--teal);border-color:var(--teal);color:#fff}
            .fieldwork-card .route{font-weight:850;color:#33444d}
            .fieldwork-map-panel{background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:14px;display:grid;gap:12px}
            .fieldwork-live-layout{display:grid;grid-template-columns:minmax(520px,1.25fr) minmax(420px,.75fr);gap:12px;align-items:stretch}
            .fieldwork-live-layout .fieldwork-map-panel{min-height:390px}
            .fieldwork-live-layout .fieldwork-board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-content:start}
            .fieldwork-live-layout .fieldwork-card{padding:10px;gap:7px}
            .fieldwork-live-layout .fieldwork-card .meta{font-size:11px;line-height:1.35}
            .fieldwork-live-layout .fieldwork-card .name{font-size:13px}
            .fieldwork-live-layout .fieldwork-actions.workflow{gap:4px}
            .fieldwork-live-layout .fieldwork-actions.workflow .btn{min-height:28px;padding:0 7px;font-size:11px}
            .fieldwork-map-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
            .fieldwork-map-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
            .fieldwork-map-controls input{min-height:34px;border:1px solid var(--line);border-radius:8px;padding:0 10px;min-width:260px}
            #fieldworkMap{min-height:300px;border:1px solid var(--line);border-radius:8px;background:#eef4f5;display:grid;color:var(--muted);font-size:13px;overflow:hidden}
            .fieldwork-map-toolbar{justify-content:flex-start}
            .fieldwork-map-toolbar .fieldwork-map-controls:first-of-type{display:none}
            .fieldwork-direct-map{position:relative;width:100%;min-height:300px;background:linear-gradient(180deg,#f7fbfc,#edf6f8);overflow:hidden}
            .fieldwork-korea-map{position:absolute;inset:8px 18px 28px;width:calc(100% - 36px);height:calc(100% - 36px);z-index:1}
            .fieldwork-korea-map .sea{fill:#eaf6f8}.fieldwork-korea-map .land{fill:#f8fbfb;stroke:#aecbd3;stroke-width:1.6;filter:drop-shadow(0 6px 12px rgba(35,78,82,.08))}
            .fieldwork-korea-map .province{fill:none;stroke:#c9dbe1;stroke-width:1.1;stroke-dasharray:3 3}.fieldwork-korea-map .island{fill:#f8fbfb;stroke:#aecbd3;stroke-width:1.2}
            .fieldwork-map-label{position:absolute;z-index:2;transform:translate(-50%,-50%);font-size:11px;font-weight:900;color:#40535c;background:rgba(255,255,255,.72);border:1px solid #dbe8ed;border-radius:999px;padding:3px 7px}
            .fieldwork-map-marker{position:absolute;z-index:3;transform:translate(-50%,-100%);display:grid;justify-items:center;gap:3px}
            .fieldwork-map-dot{width:24px;height:24px;border-radius:50% 50% 50% 0;background:var(--teal);transform:rotate(-45deg);display:grid;place-items:center;border:2px solid #fff;box-shadow:0 6px 14px rgba(8,125,143,.25)}
            .fieldwork-map-dot span{transform:rotate(45deg);color:#fff;font-size:11px;font-weight:900}
            .fieldwork-map-caption{white-space:nowrap;background:#fff;border:1px solid var(--line);border-radius:999px;padding:3px 7px;font-size:11px;font-weight:900;color:#263b45;box-shadow:0 5px 12px rgba(20,33,42,.1)}
            .fieldwork-map-marker.target .fieldwork-map-dot{background:#d84b3e}
            .fieldwork-map-gridline{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(8,125,143,.025) 1px,transparent 1px),linear-gradient(to bottom,rgba(8,125,143,.025) 1px,transparent 1px);background-size:12.5% 20%;z-index:0}
            .fieldwork-location-strip{position:absolute;left:8px;right:8px;bottom:8px;z-index:4;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px}
            .fieldwork-location-card{border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.9);padding:6px 8px;font-size:11px;display:flex;justify-content:space-between;gap:8px;box-shadow:0 4px 10px rgba(20,33,42,.06)}
            .fieldwork-location-card strong{font-size:11px}
            .fieldwork-nearest{display:grid;gap:6px}
            .fieldwork-nearest-row{display:flex;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:#fbfdfe;font-size:12px}
            .dispatch-panel{background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:14px;display:grid;gap:12px}
            .dispatch-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
            .dispatch-region{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.dispatch-region select{min-height:36px;border:1px solid var(--line);border-radius:8px;padding:0 10px;min-width:260px;background:#fff}
            .dispatch-recommend{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
            .dispatch-card{border:1px solid var(--line);border-radius:8px;background:#fbfdfe;padding:12px;display:grid;gap:7px;min-height:108px}
            .dispatch-card.best{border-color:#8bcbd3;background:#eef8fa}.dispatch-card .rank{font-size:12px;font-weight:900;color:var(--teal)}.dispatch-card .who{font-size:16px;font-weight:900}.dispatch-card .distance{font-size:18px;font-weight:900;color:#14212a}.dispatch-card .meta{font-size:12px}
            .dispatch-zones{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
            .dispatch-zone{--zone:#8bcbd3;--zone-bg:#f2fbfc;--zone-line:#c9e4e8;border:1px solid var(--zone-line);border-radius:8px;background:linear-gradient(180deg,var(--zone-bg),#fff);padding:10px;display:grid;gap:6px;min-height:74px;border-left:5px solid var(--zone)}
            .dispatch-zone strong{font-size:13px;color:#203640}.dispatch-zone .meta{color:#71828b}
            .dispatch-zone.capital{--zone:#7fb3d5;--zone-bg:#eef7ff;--zone-line:#c8e0f0}.dispatch-zone.gangwon{--zone:#b7a1d6;--zone-bg:#f7f2ff;--zone-line:#ded1ef}.dispatch-zone.chungcheong{--zone:#e5bd73;--zone-bg:#fff8ea;--zone-line:#f0d9a8}.dispatch-zone.gyeongbuk{--zone:#9db7e2;--zone-bg:#f1f6ff;--zone-line:#d4e0f5}.dispatch-zone.jeolla{--zone:#79c7cf;--zone-bg:#eefbfc;--zone-line:#c4e8ec}.dispatch-zone.gyeongnam{--zone:#8ec9a5;--zone-bg:#f0fbf4;--zone-line:#cbead5}.dispatch-zone.unknown{--zone:#b8c1c8;--zone-bg:#f6f8f9;--zone-line:#d9e0e4}
            .dispatch-person{display:flex;justify-content:space-between;gap:8px;border-radius:7px;background:rgba(255,255,255,.78);border:1px solid var(--zone-line);box-shadow:0 3px 8px rgba(20,33,42,.04);padding:6px 8px;font-size:12px}
            .dispatch-empty{border:1px dashed var(--line);border-radius:8px;background:#fbfdfe;color:var(--muted);padding:14px;text-align:center;font-size:13px}
            @media(max-width:1300px){.fieldwork-live-layout .fieldwork-board{grid-template-columns:1fr}}
            @media(max-width:1100px){.fieldwork-live-layout{grid-template-columns:1fr}.fieldwork-live-layout .fieldwork-board{grid-template-columns:repeat(2,minmax(0,1fr))}.dispatch-recommend,.dispatch-zones{grid-template-columns:1fr}}
            @media(max-width:760px){.fieldwork-kpis.workflow{grid-template-columns:repeat(2,1fr)}.fieldwork-actions.workflow{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.fieldwork-actions.workflow .btn{width:100%;padding:0 6px}}
          #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
        }
      }
      function ensureFieldworkData(){
        if(!Array.isArray(state.fieldworkLogs))state.fieldworkLogs=[];
        state.fieldworkLogs.forEach(x=>{if(!x.id)x.id=uid("fieldwork");if(!x.date&&x.time)x.date=String(x.time).slice(0,10);if(!x.savedAt)x.savedAt=x.time||new Date().toISOString()});
      }
      function todayFieldworkRows(){return (state.fieldworkLogs||[]).filter(x=>(x.date||String(x.time||"").slice(0,10))===today)}
      function latestFieldwork(name){return todayFieldworkRows().find(x=>x.person===name)}
      function lastKnownSite(name){return todayFieldworkRows().find(x=>x.person===name&&x.site)?.site||""}
      function lastKnownRegion(name){return todayFieldworkRows().find(x=>x.person===name&&x.region)?.region||""}
      function latestLocation(name){const rows=(state.fieldworkLocations||[]).filter(x=>x.person===name);return rows.sort((a,b)=>String(b.time||"").localeCompare(String(a.time||"")))[0]||null}
      function destinationForArrival(name){const latest=latestFieldwork(name);return latest?.site||lastKnownSite(name)}
      function fieldworkPeopleRank(name){const order=["이재강","김현지","최호운","안승표","김하린","최형민"];const i=order.indexOf(name);return i<0?order.length:i}
      function fwClass(status){if(status===FW.return)return"amber";if(status===FW.onsite)return"red";if(status===FW.done)return"green";return""}
      function fwRank(status){return {[FW.onsite]:0,[FW.done]:1,[FW.return]:2,"출근 전":3}[status]??4}
      function fwLabel(status){return status==="이동중"||status==="현장출발"?"현장도착":status==="현장도착"||status==="작업중"||status==="현장작업"?FW.onsite:status==="퇴근"?FW.return:status==="출근"?"출근 전":status}
      function fwStamp(){const d=new Date();return `${localDateString(d)} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`}
      function officeEtaText(minutes){
        const n=Number(minutes);
        if(!Number.isFinite(n)||n<=0)return "";
        const d=new Date(Date.now()+n*60000);
        return `사무실 도착예정 ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
      }
      function addFieldworkLog(person,status,{site="",region="",memo=""}={}){
        const stamp=fwStamp();
        state.fieldworkLogs.unshift({id:uid("fieldwork"),person:person.name,status,site,region,memo,date:stamp.slice(0,10),time:stamp,savedAt:new Date().toISOString()});
        saveState(`${person.name} ${status} 기록을 저장했습니다.`);
        renderFieldworkWorkflow();
      }
      const regionPoints=[
        ["서울",37.5665,126.978],["인천",37.4563,126.7052],["부천",37.5034,126.766],["수원",37.2636,127.0286],["화성",37.1995,126.8312],["평택",36.992,127.112],["파주",37.7599,126.7802],
        ["춘천",37.8813,127.7298],["원주",37.3422,127.9202],["강릉",37.7519,128.8761],["속초",38.207,128.5918],
        ["천안",36.8151,127.1139],["아산",36.7898,127.0017],["당진",36.893,126.628],["서산",36.7848,126.45],["공주",36.4466,127.119],["논산",36.1871,127.0988],
        ["대전",36.3504,127.3845],["청주",36.6424,127.489],["충주",36.991,127.9259],["제천",37.1326,128.191],
        ["전주",35.8242,127.148],["익산",35.9483,126.9576],["군산",35.9677,126.7366],["정읍",35.5699,126.8559],["남원",35.4164,127.3904],
        ["광주",35.1595,126.8526],["나주",35.0159,126.7108],["목포",34.8118,126.3922],["순천",34.9506,127.4872],["여수",34.7604,127.6622],["해남",34.5733,126.5989],
        ["대구",35.8714,128.6014],["구미",36.1195,128.3446],["김천",36.1398,128.1136],["상주",36.4109,128.1591],["안동",36.5684,128.7294],["포항",36.019,129.3435],["경주",35.8562,129.2247],["청도",35.6474,128.734],["칠곡",35.9956,128.4017],["성주",35.919,128.2828],["고령",35.7258,128.2629],["영천",35.9733,128.9386],["영주",36.8057,128.6241],["문경",36.5866,128.1868],
        ["부산",35.1796,129.0756],["울산",35.5384,129.3114],["창원",35.2285,128.6811],["김해",35.228,128.889],["양산",35.335,129.037],["진주",35.1803,128.1087],["밀양",35.5037,128.7467],["거창",35.6867,127.9096],["합천",35.5667,128.1658],["남해",34.8377,127.8926],
        ["제주",33.4996,126.5312]
      ].map(([name,lat,lng])=>({name,lat,lng}));
      function fieldworkMapProvider(){
        const migrationKey="fieldwork-manual-map-defaulted-v1";
        if(localStorage.getItem(migrationKey)!=="true"){
          localStorage.setItem("fieldwork-map-provider","manual");
          localStorage.setItem(migrationKey,"true");
        }
        return localStorage.getItem("fieldwork-map-provider")||"manual";
      }
      function fieldworkMapKeys(){return {kakao:localStorage.getItem("fieldwork-kakao-key")||"",naver:localStorage.getItem("fieldwork-naver-key")||""}}
      const dispatchExcludedPeople=["이재강","김현지"];
      function isDispatchExcluded(name){return dispatchExcludedPeople.includes(String(name||"").trim())}
      let fieldworkSearchTarget=null,fieldworkSearchText="";
      function haversineKm(a,b){const R=6371,toRad=d=>d*Math.PI/180,dLat=toRad(b.lat-a.lat),dLng=toRad(b.lng-a.lng),s=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;return 2*R*Math.atan2(Math.sqrt(s),Math.sqrt(1-s))}
      function regionPoint(text){const s=String(text||"").replace(/\s/g,"");return regionPoints.find(r=>s.includes(r.name))||null}
      function manualLocationFromLog(log){const pt=regionPoint(log?.region)||regionPoint(log?.memo)||regionPoint(log?.site);return pt?{lat:pt.lat,lng:pt.lng,label:log.site||pt.name,time:log.time,source:"manual"}:null}
      function personLocations(){return (state.people||[]).map(p=>{const latest=latestFieldwork(p.name),manual=manualLocationFromLog(latest),gps=latestLocation(p.name),loc=manual||gps;return{p,loc,latest}}).filter(x=>x.loc)}
      function renderNearestList(target=null){const box=$("#fieldworkNearest");if(!box)return;const rows=personLocations().map(x=>({...x,km:target?haversineKm(target,x.loc):null})).sort((a,b)=>(a.km??9999)-(b.km??9999)||fieldworkPeopleRank(a.p.name)-fieldworkPeopleRank(b.p.name));box.innerHTML=rows.length?rows.slice(0,6).map(x=>`<div class="fieldwork-nearest-row"><strong>${esc(x.p.name)}</strong><span>${x.km!==null?`${x.km.toFixed(1)}km · `:""}${esc(x.latest?.site||x.loc.label||"현재 위치")} · ${esc(String(x.loc.time||"").slice(11,16))}</span></div>`).join(""):`<div class="meta">아직 공유된 직원 위치가 없습니다.</div>`}
      function setFieldworkMapStatus(msg){const map=$("#fieldworkMap");if(map)map.innerHTML=`<div>${esc(msg)}</div>`}
      function loadScriptOnce(src,id){return new Promise((resolve,reject)=>{if(id&&document.getElementById(id)){resolve();return}const s=document.createElement("script");if(id)s.id=id;s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
      function renderManualFieldworkMap(target=null){
        const points=personLocations(),minLat=33.0,maxLat=38.7,minLng=125.9,maxLng=130.2;
        const toXY=loc=>({x:Math.max(5,Math.min(95,(loc.lng-minLng)/(maxLng-minLng)*100)),y:Math.max(8,Math.min(92,(maxLat-loc.lat)/(maxLat-minLat)*100))});
        const regionLabels=[["수도권",37.45,127.05],["강원",37.55,128.15],["충청",36.55,127.35],["전라",35.35,126.95],["경북",36.0,128.45],["경남",35.25,128.45],["제주",33.5,126.52]];
        const labels=regionLabels.map(([name,lat,lng])=>{const xy=toXY({lat,lng});return`<span class="fieldwork-map-label" style="left:${xy.x}%;top:${xy.y}%">${esc(name)}</span>`}).join("");
        const koreaMap=`<svg class="fieldwork-korea-map" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <rect class="sea" x="0" y="0" width="100" height="100" rx="10"></rect>
          <path class="land" d="M36 7 L48 5 L61 8 L70 17 L78 28 L75 39 L82 50 L73 61 L72 73 L62 86 L51 95 L40 91 L34 80 L25 71 L28 59 L21 49 L25 36 L31 27 L32 16 Z"></path>
          <path class="province" d="M32 16 L45 20 L55 19 L70 17"></path>
          <path class="province" d="M25 36 L39 38 L52 36 L75 39"></path>
          <path class="province" d="M21 49 L38 52 L50 49 L82 50"></path>
          <path class="province" d="M28 59 L42 64 L55 63 L73 61"></path>
          <path class="province" d="M34 80 L47 76 L58 78 L72 73"></path>
          <path class="province" d="M48 5 L47 21 L52 36 L50 49 L55 63 L58 78 L62 86"></path>
          <path class="island" d="M18 91 C22 88 31 89 35 92 C31 96 23 97 18 94 Z"></path>
          <path class="island" d="M12 40 C15 38 18 39 19 42 C17 45 13 44 12 40 Z"></path>
        </svg>`;
        const grouped=new Map();
        points.forEach(item=>{const key=`${item.loc.lat.toFixed(3)},${item.loc.lng.toFixed(3)}`;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(item)});
        const markers=[...grouped.values()].map((items,groupIndex)=>items.map((item,i)=>{const xy=toXY(item.loc),offset=(i-(items.length-1)/2)*34;return`<div class="fieldwork-map-marker" style="left:calc(${xy.x}% + ${offset}px);top:${xy.y}%"><div class="fieldwork-map-dot"><span>${esc(item.p.name.slice(0,1))}</span></div><div class="fieldwork-map-caption">${esc(item.p.name)} · ${esc(item.latest?.site||item.loc.label||"현재 위치")}</div></div>`}).join("")).join("");
        const targetMarker=target?(()=>{const xy=toXY(target);return`<div class="fieldwork-map-marker target" style="left:${xy.x}%;top:${xy.y}%"><div class="fieldwork-map-dot"><span>!</span></div><div class="fieldwork-map-caption">긴급 방문지</div></div>`})():"";
        const strip=points.length?`<div class="fieldwork-location-strip">${points.map(({p,latest,loc})=>`<div class="fieldwork-location-card"><strong>${esc(p.name)}</strong><span>${esc(latest?.site||loc.label||"-")}</span></div>`).join("")}</div>`:"";
        const map=$("#fieldworkMap");if(map){map.className="";map.removeAttribute("style");map.innerHTML=`<div class="fieldwork-direct-map"><div class="fieldwork-map-gridline"></div>${koreaMap}${labels}${markers}${targetMarker}${strip}</div>`}
      }
      async function renderFieldworkMap(){
        const provider=fieldworkMapProvider(),keys=fieldworkMapKeys(),points=personLocations();
        renderNearestList();
        if(!$("#fieldworkMap"))return;
        if(provider==="manual"){renderManualFieldworkMap();return}
        if(!keys[provider]){renderManualFieldworkMap();return}
        const center=points[0]?.loc||{lat:35.5037,lng:128.7467};
        try{
          if(provider==="kakao"){
            await loadScriptOnce(`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(keys.kakao)}&libraries=services&autoload=false`,"kakaoMapSdk");
            await new Promise(resolve=>kakao.maps.load(resolve));
            const map=new kakao.maps.Map($("#fieldworkMap"),{center:new kakao.maps.LatLng(center.lat,center.lng),level:8});
            points.forEach(({p,loc,latest})=>{const marker=new kakao.maps.Marker({map,position:new kakao.maps.LatLng(loc.lat,loc.lng),title:p.name});const info=new kakao.maps.InfoWindow({content:`<div style="padding:6px 8px;font-size:12px;font-weight:800">${esc(p.name)}<br>${esc(latest?.site||loc.label||"현재 위치")}</div>`});kakao.maps.event.addListener(marker,"click",()=>info.open(map,marker))});
          }else{
            await loadScriptOnce(`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(keys.naver)}&submodules=geocoder`,"naverMapSdk");
            const map=new naver.maps.Map("fieldworkMap",{center:new naver.maps.LatLng(center.lat,center.lng),zoom:10});
            points.forEach(({p,loc,latest})=>{const marker=new naver.maps.Marker({map,position:new naver.maps.LatLng(loc.lat,loc.lng),title:p.name});const info=new naver.maps.InfoWindow({content:`<div style="padding:6px 8px;font-size:12px;font-weight:800">${esc(p.name)}<br>${esc(latest?.site||loc.label||"현재 위치")}</div>`});naver.maps.Event.addListener(marker,"click",()=>info.open(map,marker))});
          }
        }catch{renderManualFieldworkMap()}
      }
      function geocodeEmergencyAddress(address){
        const provider=fieldworkMapProvider();
        return new Promise((resolve,reject)=>{
          if(!address)return reject();
          if(provider==="kakao"&&window.kakao?.maps?.services){new kakao.maps.services.Geocoder().addressSearch(address,(res,status)=>status===kakao.maps.services.Status.OK&&res[0]?resolve({lat:Number(res[0].y),lng:Number(res[0].x)}):reject());return}
          if(provider==="naver"&&window.naver?.maps?.Service){naver.maps.Service.geocode({query:address},(status,res)=>status===naver.maps.Service.Status.OK&&res.v2.addresses[0]?resolve({lat:Number(res.v2.addresses[0].y),lng:Number(res.v2.addresses[0].x)}):reject());return}
          const m=address.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);if(m)resolve({lat:Number(m[1]),lng:Number(m[2])});else{const pt=regionPoint(address);pt?resolve(pt):reject()}
        })
      }
      function dispatchZoneName(text){
        const s=String(text||"").replace(/\s/g,"");
        if(["서울","인천","부천","수원","화성","평택","파주"].some(x=>s.includes(x)))return"수도권";
        if(["춘천","원주","강릉","속초"].some(x=>s.includes(x)))return"강원권";
        if(["천안","아산","당진","서산","공주","논산","대전","청주","충주","제천"].some(x=>s.includes(x)))return"충청권";
        if(["대구","구미","김천","상주","안동","포항","경주","청도","칠곡","성주","고령","영천","영주","문경"].some(x=>s.includes(x)))return"경북권";
        if(["전주","익산","군산","정읍","남원","광주","나주","목포","순천","여수","해남"].some(x=>s.includes(x)))return"전라권";
        if(["부산","울산","창원","김해","양산","진주","밀양","거창","합천","남해"].some(x=>s.includes(x)))return"경남권";
        if(s.includes("제주"))return"제주권";
        return"위치 미입력";
      }
      function dispatchRows(target=null){
        return (state.people||[]).filter(p=>!isDispatchExcluded(p.name)).map(p=>{const latest=latestFieldwork(p.name),loc=manualLocationFromLog(latest)||latestLocation(p.name),status=fwLabel(latest?.status||"출근 전"),place=latest?.site||loc?.label||"위치 없음",region=[latest?.region,latest?.memo].filter(Boolean).join(" · "),km=target&&loc?haversineKm(target,loc):null;return{p,latest,loc,status,place,region,km,zone:dispatchZoneName([latest?.region,latest?.memo,latest?.site,loc?.label].filter(Boolean).join(" "))}}).sort((a,b)=>(a.km??9999)-(b.km??9999)||fieldworkPeopleRank(a.p.name)-fieldworkPeopleRank(b.p.name))}
      function renderDispatchPanel(target=null,targetText=""){
        target=target||fieldworkSearchTarget;
        targetText=targetText||fieldworkSearchText;
        const rows=dispatchRows(target),available=rows.filter(x=>x.loc),top=available.slice(0,3);
        const topHtml=target?top.length?top.map((x,i)=>`<div class="dispatch-card ${i===0?"best":""}"><div class="rank">${i+1}순위 추천</div><div class="who">${esc(x.p.name)}</div><div class="distance">${x.km?.toFixed(1)}km</div><div class="meta">${esc(x.place)} · ${esc(x.status)}</div><div class="meta">${esc(x.region||x.zone)}</div></div>`).join(""):`<div class="dispatch-empty">거리 계산 가능한 직원 위치가 없습니다.</div>`:`<div class="dispatch-empty">현장 방문 지역을 선택하면 가까운 직원 TOP 3가 표시됩니다.</div>`;
        const zones=[["수도권","capital"],["강원권","gangwon"],["충청권","chungcheong"],["경북권","gyeongbuk"],["전라권","jeolla"],["경남권","gyeongnam"],["위치 미입력","unknown"]];
        const zoneHtml=zones.map(([z,cls])=>{const people=rows.filter(x=>x.zone===z||z==="위치 미입력"&&x.zone==="제주권");return`<div class="dispatch-zone ${cls}"><strong>${esc(z)}</strong>${people.length?people.map(x=>`<div class="dispatch-person"><span>${esc(x.p.name)}</span><span>${esc(x.place)} · ${esc(x.status)}</span></div>`).join(""):`<div class="meta">없음</div>`}</div>`}).join("");
        const options=`<option value="">방문 지역 선택</option>`+regionPoints.map(r=>`<option value="${esc(r.name)}" ${r.name===targetText?"selected":""}>${esc(r.name)}</option>`).join("");
        return `<section class="dispatch-panel"><div class="dispatch-head"><h2>출동 추천 관제판</h2></div><div class="dispatch-region"><select id="fieldworkRegionSelect">${options}</select><button class="btn" id="fieldworkClearRegion">초기화</button></div><div class="dispatch-recommend">${topHtml}</div><div class="dispatch-zones">${zoneHtml}</div></section>`;
      }
      function fieldworkWorkflowKpis(){
        const people=state.people||[],latest=people.map(p=>latestFieldwork(p.name)).map(x=>x&&{...x,status:fwLabel(x.status)}),count=s=>latest.filter(x=>x?.status===s).length;
        return {total:people.length,recorded:latest.filter(Boolean).length,onsite:count(FW.onsite),done:count(FW.done),returning:count(FW.return)};
      }
      function renderFieldworkWorkflow(){
        ensureFieldworkPanel();ensureFieldworkData();
        if(currentView!=="fieldwork")return;
        $("#kpis")?.classList.add("hidden");
        els.dashboardView?.classList.add("hidden");els.adminView?.classList.add("hidden");els.mainGrid?.classList.add("hidden");
        els.fieldworkView.classList.remove("hidden");
        els.pageTitle.textContent="외근현황";
        els.pageSub.textContent="현장도착, 작업완료, 사무실복귀만 눌러 현장 이동 흐름을 간단히 기록합니다.";
        const topAction=$("#addProjectBtn");if(topAction){topAction.textContent="엑셀 내보내기";topAction.style.display=adminUnlocked?"":"none"}
        const k=fieldworkWorkflowKpis(),logs=todayFieldworkRows().slice().sort((a,b)=>String(b.time||"").localeCompare(String(a.time||"")));
        const cards=(state.people||[]).map((p,i)=>({p,i,latest:latestFieldwork(p.name)})).map(x=>({...x,status:fwLabel(x.latest?.status||"출근 전")})).sort((a,b)=>fieldworkPeopleRank(a.p.name)-fieldworkPeopleRank(b.p.name)||a.p.name.localeCompare(b.p.name,"ko")).map(({p,i,latest,status})=>{
          const site=latest?.site||"현장 미입력",region=latest?.region||"지역 미입력",memo=latest?.memo||"메모 없음";
          return `<div class="fieldwork-card"><div class="fieldwork-status"><div><div class="name">${esc(p.name)}</div><div class="meta">${esc(p.role||"직원")} · ${esc(p.area||"담당업무 미입력")}</div></div><span class="badge ${fwClass(status)}">${esc(status)}</span></div><div class="meta route">${latest?`${esc(site)} · ${esc(region)}`:"오늘 기록 없음"}</div><div class="meta">${esc(memo)}</div><div class="fieldwork-actions workflow"><button class="btn primary" data-fw-action="arrive" data-person="${i}">현장도착</button><button class="btn" data-fw-action="done" data-person="${i}">작업완료</button><button class="btn" data-fw-action="return" data-person="${i}">사무실복귀</button></div></div>`;
        }).join("");
        els.fieldworkView.innerHTML=`<div class="fieldwork-shell"><div class="fieldwork-top"><div class="meta">각 현장에서는 현장도착과 작업완료만 반복하고, 사무실복귀는 마지막 현장을 출발지로 기록합니다.</div><div class="row-actions"></div></div><div class="fieldwork-kpis workflow"><div class="fieldwork-kpi"><div class="label">등록 직원</div><div class="value">${k.total}</div></div><div class="fieldwork-kpi"><div class="label">오늘 기록</div><div class="value">${k.recorded}</div></div><div class="fieldwork-kpi"><div class="label">현장도착</div><div class="value">${k.onsite}</div></div><div class="fieldwork-kpi"><div class="label">작업완료</div><div class="value">${k.done}</div></div><div class="fieldwork-kpi"><div class="label">사무실복귀</div><div class="value">${k.returning}</div></div></div><section class="fieldwork-live-layout">${renderDispatchPanel()}<section class="fieldwork-board">${cards||`<div class="dash-empty">직원을 먼저 등록하면 외근 현황을 기록할 수 있습니다.</div>`}</section></section><section class="fieldwork-log"><div class="fieldwork-row no-time ${adminUnlocked?"admin-delete":""}"><span>직원</span><span>상태</span><span>발전소/현장</span><span>지역/메모</span>${adminUnlocked?"<span>관리</span>":""}</div>${logs.length?logs.map(x=>{const status=fwLabel(x.status);return `<div class="fieldwork-row no-time ${adminUnlocked?"admin-delete":""}"><strong>${esc(x.person)}</strong><span><span class="badge ${fwClass(status)}">${esc(status)}</span></span><span>${esc(x.site||"-")}</span><span>${esc([x.region,x.memo].filter(Boolean).join(" · ")||"-")}</span>${adminUnlocked?`<span><button class="btn icon danger" data-delete-fieldwork="${esc(x.id)}">삭제</button></span>`:""}</div>`}).join(""):`<div class="fieldwork-row no-time"><span class="meta">오늘 외근 기록이 없습니다.</span></div>`}</section></div>`;
      }
      const baseRenderCurrentForWorkflow=renderCurrentContent;
      renderCurrentContent=function(){if(currentView==="fieldwork"){renderFieldworkWorkflow();return}baseRenderCurrentForWorkflow()};
      const baseSyncViewForWorkflow=syncViewChrome;
      syncViewChrome=function(){baseSyncViewForWorkflow();if(currentView==="fieldwork"){els.pageTitle.textContent="외근현황";els.pageSub.textContent="현장도착, 작업완료, 사무실복귀만 눌러 현장 이동 흐름을 간단히 기록합니다.";const topAction=$("#addProjectBtn");if(topAction){topAction.textContent="엑셀 내보내기";topAction.style.display=adminUnlocked?"":"none"}}};
      document.addEventListener("click",e=>{
        const t=e.target.closest("button")||e.target;
        if(t.dataset.fwAction){
          e.preventDefault();e.stopImmediatePropagation();
          const person=state.people[Number(t.dataset.person)];if(!person)return;
          const action=t.dataset.fwAction;
          if(action==="arrive"){const site=prompt("도착한 발전소/현장명을 입력하세요.",lastKnownSite(person.name));if(!site)return;const region=prompt("지역 또는 현장 메모를 입력하세요.",lastKnownRegion(person.name))||"";addFieldworkLog(person,FW.onsite,{site,region,memo:"현장 도착"});return}
          if(action==="done"){const site=lastKnownSite(person.name);if(!site){toast("먼저 현장도착을 기록해주세요.");return}const memo=prompt("작업 결과나 특이사항을 입력하세요.","작업 완료")||"작업 완료";addFieldworkLog(person,FW.done,{site,region:lastKnownRegion(person.name),memo});return}
          if(action==="return"){const site=lastKnownSite(person.name);if(!site){toast("복귀 출발 현장이 없습니다. 먼저 현장도착을 기록해주세요.");return}const minutes=prompt(`${site}에서 사무실까지 예상 소요시간을 분 단위로 입력하세요.`, "30");const eta=officeEtaText(minutes);const memo=[`출발: ${site}`,eta].filter(Boolean).join(" · ");addFieldworkLog(person,FW.return,{site,region:lastKnownRegion(person.name),memo});return}
        }
        if(t.id==="fieldworkMapProvider"){localStorage.setItem("fieldwork-map-provider",t.value);renderFieldworkMap();return}
        if(t.id==="fieldworkMapKeyBtn"){const provider=fieldworkMapProvider();if(provider==="manual"){toast("직접입력 지도는 API 키 없이 사용할 수 있습니다.");return}const current=fieldworkMapKeys()[provider],key=prompt(`${provider==="kakao"?"카카오 JavaScript 키":"네이버 ncpKeyId"}를 입력하세요.`,current);if(key!==null){localStorage.setItem(provider==="kakao"?"fieldwork-kakao-key":"fieldwork-naver-key",key.trim());renderFieldworkMap()}return}
        if(t.id==="fieldworkShareLocationBtn"){const name=prompt("위치를 공유할 직원 이름을 입력하세요.",state.people[0]?.name||"");if(!name)return;if(!navigator.geolocation){toast("이 브라우저에서는 위치공유를 사용할 수 없습니다.");return}navigator.geolocation.getCurrentPosition(pos=>{state.fieldworkLocations=state.fieldworkLocations||[];state.fieldworkLocations.unshift({id:uid("loc"),person:name,lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,label:"휴대폰 현재 위치",time:new Date().toISOString(),date:today});saveState(`${name} 현재 위치를 공유했습니다.`);renderFieldworkWorkflow()},()=>toast("위치 권한이 거부되었거나 위치를 가져오지 못했습니다."),{enableHighAccuracy:true,timeout:10000});return}
        if(t.id==="fieldworkClearRegion"){fieldworkSearchTarget=null;fieldworkSearchText="";const panel=document.querySelector(".dispatch-panel");if(panel)panel.outerHTML=renderDispatchPanel();toast("방문 지역 선택을 초기화했습니다.");return}
        if(currentView==="fieldwork"&&t.id==="addProjectBtn"){e.preventDefault();e.stopImmediatePropagation();if(!adminUnlocked){toast("엑셀 내보내기는 관리자만 사용할 수 있습니다.");return}exportFieldworkExcel()}
      },true);
      document.addEventListener("change",e=>{const t=e.target;if(t.id==="fieldworkMapProvider"){localStorage.setItem("fieldwork-map-provider",t.value);renderFieldworkMap()}if(t.id==="fieldworkRegionSelect"){const pt=regionPoint(t.value);fieldworkSearchTarget=pt;fieldworkSearchText=pt?t.value:"";const panel=document.querySelector(".dispatch-panel");if(panel)panel.outerHTML=renderDispatchPanel(fieldworkSearchTarget,fieldworkSearchText);if(pt)toast(`${t.value} 기준으로 가까운 직원을 정렬했습니다.`)}},true);
    })();    (function removeScheduleCategory(){
      function stripScheduleCategory(){
        if(Array.isArray(state.nav)) state.nav=state.nav.filter(n=>n.label!=="일정관리"&&n.label!=="직원업무");
        if(currentView==="assignments"){
          currentView="todos";
          localStorage.setItem(viewStorageKey,"todos");
        }
      }
      const baseNormalizeWithoutSchedule=normalizeState;
      normalizeState=function(){baseNormalizeWithoutSchedule();stripScheduleCategory()};
      stripScheduleCategory();
    })();
    (function keepDeletedNavHidden(){
      const baseNormalizeForHiddenNav=normalizeState;
      normalizeState=function(){baseNormalizeForHiddenNav();state.nav=(state.nav||[]).filter(n=>!isNavHidden(n.label))};
      document.addEventListener("click",e=>{
        const t=e.target.closest("button")||e.target;
        if(t.dataset?.deleteAdminNav!==undefined){
          e.preventDefault();e.stopImmediatePropagation();
          const i=Number(t.dataset.deleteAdminNav),item=state.nav[i];
          if(!item)return;
          hideNavLabel(item.label);
          state.nav.splice(i,1);
          saveState("카테고리를 삭제했습니다.");
          render();
          return;
        }
        if(t.dataset?.moveAdminNav!==undefined){
          e.preventDefault();e.stopImmediatePropagation();
          const i=Number(t.dataset.moveAdminNav),j=i+Number(t.dataset.dir);
          if(j>=0&&j<state.nav.length){[state.nav[i],state.nav[j]]=[state.nav[j],state.nav[i]];saveState("카테고리 순서를 변경했습니다.");render()}
          return;
        }
        if(t.id==="adminAddNavBtn"){
          e.preventDefault();e.stopImmediatePropagation();
          const label="새 카테고리";
          showNavLabel(label);
          state.nav.push({icon:"•",label});
          saveState("카테고리를 추가했습니다.");
          render();
        }
      },true);
    })();
    (function myWorkPopup(){
      let popupShown=false;
      function authDisplayName(){return authUser?.user_metadata?.full_name||authUser?.user_metadata?.name||""}
      function currentPerson(){
        const current=currentStaff();
        if(current)return current;
        const name=String(authDisplayName()).replace(/\s/g,"");
        return (state.people||[]).find(p=>String(p.name||"").replace(/\s/g,"")===name)||null;
      }
      function taskBelongsTo(t,name){return [t.owner,...(Array.isArray(t.helpers)?t.helpers:[])].filter(Boolean).includes(name)}
      function openTasksFor(name){
        ensureTaskLinks();
        return (state.todos||[]).map((t,i)=>({t:normalizeTodo(t),i})).filter(({t})=>taskBelongsTo(t,name)&&t.status!==KR.done&&t.status!==KR.cancel);
      }
      function ensurePopupUi(){
        if(!$("#myWorkPopupStyle"))document.head.insertAdjacentHTML("beforeend",`<style id="myWorkPopupStyle">
          .my-work-modal{width:min(460px,calc(100vw - 36px));padding:18px;border-radius:10px}
          .my-work-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}
          .my-work-stat{border:1px solid var(--line);border-radius:8px;background:#fbfdfe;padding:10px}
          .my-work-stat .value{font-size:22px;margin-top:4px}
          .my-work-list{display:grid;gap:7px;margin-top:10px;max-height:260px;overflow:auto}
          .my-work-item{border:1px solid var(--line);border-radius:8px;background:#fff;padding:9px 10px;display:grid;gap:4px;text-align:left}
          .my-work-item strong{font-size:13px}.my-work-actions{justify-content:flex-end;margin-top:14px}
          @media(max-width:520px){.my-work-summary{grid-template-columns:1fr}}
        #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
        if(!$("#myWorkPopup"))document.body.insertAdjacentHTML("beforeend",`<div class="overlay" id="myWorkPopup"><div class="modal my-work-modal"><div class="modal-head"><h2 id="myWorkTitle">내 업무 알림</h2><button class="btn icon" data-close-my-work>×</button></div><div id="myWorkBody"></div><div class="toolbar my-work-actions"><button class="btn" data-close-my-work>닫기</button><button class="btn primary" id="openMyTodoBtn">내 할일 보기</button></div></div></div>`);
      }
      window.showMyWorkPopup=function(force=false){
        if((popupShown&&!force)||!loginName()||!Array.isArray(state.people))return;
        const person=currentPerson();
        if(!person)return;
        popupShown=true;
        ensurePopupUi();
        const rows=openTasksFor(person.name);if(!rows.length)return;const late=rows.filter(({t})=>t.due&&t.due<today).length,todayRows=rows.filter(({t})=>t.due===today).length;
        $("#myWorkTitle").textContent=`${person.name}님, 진행 중인 업무`;
        $("#myWorkBody").innerHTML=`<div class="my-work-summary"><div class="my-work-stat"><div class="label">진행 업무</div><div class="value">${rows.length}</div></div><div class="my-work-stat"><div class="label">오늘 마감</div><div class="value">${todayRows}</div></div><div class="my-work-stat"><div class="label">기한 지남</div><div class="value">${late}</div></div></div>${rows.length?`<div class="my-work-list">${rows.slice(0,6).map(({t,i})=>`<button class="my-work-item" data-my-work-todo="${i}"><strong>${esc(t.title)}</strong><span class="meta">${esc(t.status)} · ${esc(t.priority||KR.normal)} · 마감 ${esc(t.due||"-")}</span></button>`).join("")}</div>`:`<div class="meta">현재 진행 중인 업무가 없습니다.</div>`}`;
        $("#myWorkPopup").classList.add("open");popupShown=true;
      };
      document.addEventListener("click",e=>{
        const t=e.target.closest("button")||e.target;
        if(e.target?.id==="myWorkPopup"){$("#myWorkPopup")?.classList.remove("open");return}
        if(t.dataset.closeMyWork!==undefined){$("#myWorkPopup")?.classList.remove("open");return}
        if(t.id==="openMyTodoBtn"){const person=currentPerson();$("#myWorkPopup")?.classList.remove("open");if(person){todoOwnerFilter=person.name;todoStatusFilter=KR.all;todoViewMode="board";goToView("todos","할일관리");renderTodoBoard()}return}
        if(t.dataset.myWorkTodo!==undefined){$("#myWorkPopup")?.classList.remove("open");goToView("todos","할일관리");openTodoModal(Number(t.dataset.myWorkTodo));return}
      },true);
    })();
    (function setupDetailedTodoDatabase(){
      function todoDataFields(t){
        const progress=todoProgress(t);
        return {
          title:t.title||"",
          people:peopleText(t),
          project:t.project||KR.general,
          type:t.type||KR.general,
          status:t.status||KR.todo,
          priority:t.priority||KR.normal,
          start:t.start||"",
          due:t.due||"",
          time:[t.startTime,t.endTime].filter(Boolean).join("~"),
          progress:`${progress.pct}%`,
          detail:t.detail||"",
          result:t.result||"",
          location:t.location||"",
          report:t.kakaoSharedAt?`카톡 공유 ${t.kakaoSharedAt}`:"미공유"
        }
      }
      function dbFilterInput(key,label){return `<input class="field" data-todo-list-filter="${esc(key)}" value="${esc(todoListFilters[key]||"")}" placeholder="${esc(label)}">`}
      function dbCell(v){return `<span class="todo-db-cell">${esc(v||"-")}</span>`}
      function dbProgress(t){const p=todoProgress(t);return `<span class="todo-db-progress"><span><i style="width:${p.pct}%"></i></span><strong>${p.pct}%</strong></span>`}
      const baseTodoListHtmlForDb=todoListHtml;
      todoListHtml=function(rows){
        rows=todoFilteredRows(rows);
        const head=`<div class="todo-list-row todo-db-row head"><span>${todoSortButton("title","업무명")}</span><span>${todoSortButton("owner","담당/공동")}</span><span>현장/구분</span><span>${todoSortButton("status","상태/우선")}</span><span>기간/시간</span><span>진행률</span><span>내용/결과/위치</span><span>관리</span></div>`;
        const filters=`<div class="todo-list-row todo-db-row filter"><span>${dbFilterInput("title","업무명")}</span><span>${dbFilterInput("owner","담당")}</span><span>${dbFilterInput("project","현장/구분")}</span><span>${dbFilterInput("status","상태")}</span><span>${dbFilterInput("due","날짜")}</span><span></span><span>${dbFilterInput("detail","내용/결과")}</span><span></span></div>`;
        const body=rows.length?rows.map(({t,i})=>`<div class="todo-list-row todo-db-row" style="border-left:5px solid ${esc(personColor(t.owner))}"><strong>${esc(t.title)} ${todoShareBadge(t)}</strong><span>${dbCell(peopleText(t))}</span><span>${dbCell(`${t.project||KR.general} / ${t.type||KR.general}`)}</span><span><span class="badge ${statusClass(t.status)}">${esc(t.status)}</span><br>${dbCell(t.priority||KR.normal)}</span><span>${dbCell(`${t.start||"-"} ~ ${t.due||"-"}`)}<br>${dbCell([t.startTime,t.endTime].filter(Boolean).join("~"))}</span><span>${dbProgress(t)}</span><span>${dbCell(t.detail||"")}<br>${t.result?`<b>결과</b> ${esc(t.result)}<br>`:""}${t.location?`<b>위치</b> ${esc(t.location)}`:""}</span><span class="todo-db-actions"><button class="btn icon" data-edit-todo="${i}">✎</button><button class="btn" data-toggle-todo-share="${i}">${t.kakaoSharedAt?"미공유로":"공유처리"}</button><button class="btn icon danger" data-delete-todo="${i}">×</button></span></div>`).join(""):`<div class="todo-list-row"><span class="meta">조건에 맞는 할일이 없습니다.</span></div>`;
        return `<div class="todo-list todo-db-list">${head}${filters}${body}</div>`
      }
      function exportTodoDatabase(){
        ensureConfigLists();ensureTaskLinks();
        const headers=["업무명","담당/공동","현장","구분","상태","우선순위","시작일","마감일","시간","진행률","상세내용","처리결과","위치","보고상태"];
        const rows=state.todos.map(t=>{const d=todoDataFields(normalizeTodo(t));return [d.title,d.people,d.project,d.type,d.status,d.priority,d.start,d.due,d.time,d.progress,d.detail,d.result,d.location,d.report]});
        const csv=[headers,...rows].map(row=>row.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\r\n");
        const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
        const a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download=`할일업무DB_${today}.csv`;
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(a.href),1000);
        toast("할일 업무 DB를 엑셀용 CSV로 내보냈습니다.");
      }
      const baseRenderTodoBoardForDb=renderTodoBoard;
      renderTodoBoard=function(){
        baseRenderTodoBoardForDb();
        const toolbar=$("#todoBoardPanel .todo-toolbar");
        if(toolbar&&!$("#todoExportDbBtn"))toolbar.insertAdjacentHTML("beforeend",`<button class="btn" id="todoExportDbBtn">목록 엑셀</button>`);
      }
      if(!$("#todoDbStyle"))document.head.insertAdjacentHTML("beforeend",`<style id="todoDbStyle">
        .todo-db-list{overflow:auto}.todo-db-row{grid-template-columns:minmax(180px,1.4fr) minmax(120px,.8fr) minmax(130px,.9fr) minmax(95px,.65fr) minmax(130px,.85fr) minmax(85px,.55fr) minmax(230px,1.7fr) minmax(126px,auto);align-items:start}.todo-db-row.head{position:sticky;top:0;z-index:2}.todo-db-cell{display:inline-block;color:var(--muted);font-size:12px;line-height:1.45;word-break:keep-all;overflow-wrap:anywhere}.todo-db-progress{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center}.todo-db-progress span{height:7px;border-radius:999px;background:#e8eef0;overflow:hidden}.todo-db-progress i{display:block;height:100%;background:var(--teal)}.todo-db-progress strong{font-size:11px}.todo-db-actions{display:flex;gap:5px;flex-wrap:wrap}@media(max-width:900px){.todo-db-row{grid-template-columns:1fr}.todo-db-row.head,.todo-db-row.filter{display:none}.todo-db-actions{margin-top:6px}}
      #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
      document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.id==="todoExportDbBtn"){e.preventDefault();exportTodoDatabase()}},true);
    })();
    (function setupMeetingMinutes(){
      const sampleMeetings=[
        {id:"meeting-sample-1",date:"2026-06-05",time:"09:30",title:"주간 공무팀 업무회의",host:"이재강",attendees:["이재강","김현지","최호운","최형민"],project:"일반업무",type:"주간회의",summary:"이번 주 시공일정, 자재 입고, 한전 접수 지연 건을 점검하고 담당자별 후속 조치를 정리했습니다.",decisions:["시공일정 지연 건은 매일 오전 대시보드에서 확인","자재 입고 예정일은 할일관리 마감일과 함께 관리","한전 접수 보완 요청은 담당자별로 당일 기록"]},
        {id:"meeting-sample-2",date:"2026-06-04",time:"16:00",title:"시공일정 점검 회의",host:"이재강",attendees:["이재강","안승표","김하린"],project:"시공일정",type:"현장점검",summary:"남해/다온/동광 시공팀별 진행률과 이번 주 확인 필요 현장을 점검했습니다.",decisions:["완료 현장은 보고서 사진 정리 후 A/S 양식 검토","진행중 현장은 외근현황에 방문 기록 남김","시공일정 변경 시 담당자가 당일 할일로 등록"]},
        {id:"meeting-sample-3",date:"2026-06-03",time:"11:00",title:"업무 데이터 관리 방향 회의",host:"이재강",attendees:["이재강","김현지","최호운"],project:"할일관리",type:"개선회의",summary:"카톡 보고를 별도 패널로 분리하기보다 할일 목록을 상세 DB로 만들어 관리하기로 방향을 정했습니다.",decisions:["할일 목록 컬럼을 업무 DB처럼 상세화","엑셀 내보내기 기능으로 월별 업무 분석 준비","회의록 카테고리를 추가해서 결정사항을 기록"]}
      ];
      let selectedMeetingId="";
      function ensureMeetingNav(){if(!state.nav.some(n=>n.label==="회의록")){const reportIndex=state.nav.findIndex(n=>n.label==="보고서"),adminIndex=state.nav.findIndex(n=>n.label.includes("관리자")),insertAt=reportIndex>=0?reportIndex+1:(adminIndex>=0?adminIndex:state.nav.length);state.nav.splice(insertAt,0,{icon:"▤",label:"회의록",access:"member"})}}
      function ensureMeetings(){state.meetings=Array.isArray(state.meetings)?state.meetings:[];state.meetingSamplesSeeded=true;state.meetingSamplesDisabled=true;if(selectedMeetingId&&!state.meetings.some(m=>m.id===selectedMeetingId))selectedMeetingId=state.meetings[0]?.id||"";if(!selectedMeetingId&&state.meetings[0])selectedMeetingId=state.meetings[0].id}
      const baseNormalizeForMeetings=normalizeState;
      normalizeState=function(){baseNormalizeForMeetings();ensureMeetingNav();ensureMeetings()}
      const baseViewForMeetings=viewForLabel;
      viewForLabel=function(label){return label.includes("회의록")?"meetings":baseViewForMeetings(label)}
      const baseIsActiveForMeetings=isActive;
      isActive=function(label){return currentView==="meetings"?label.includes("회의록"):baseIsActiveForMeetings(label)}
      function meetingRows(){ensureMeetings();return state.meetings.slice().sort((a,b)=>String(b.date+b.time).localeCompare(String(a.date+a.time)))}
      function selectedMeeting(){ensureMeetings();return state.meetings.find(m=>m.id===selectedMeetingId)||state.meetings[0]}
      function meetingCard(m){return `<div class="meeting-list-item"><button class="meeting-card ${selectedMeeting()?.id===m.id?"active":""}" data-meeting-id="${esc(m.id)}"><strong>${esc(m.title)}</strong><span>${esc(m.date)} ${esc(m.time)} · ${esc(m.host)} · ${esc(m.type)}</span><em>${esc(m.summary)}</em></button><button class="meeting-delete-mini" title="회의록 삭제" data-delete-meeting="${esc(m.id)}">×</button></div>`}
      function disableMeetingSamples(){state.meetingSamplesSeeded=true;state.meetingSamplesDisabled=true}
      function meetingPlainText(v){return String(v??"").replace(/\s+/g," ").trim()}
      function meetingExcelCell(v){return `<td style="border:1px solid #d8e0e5;padding:8px;vertical-align:top;mso-number-format:'\\@';">${esc(v)}</td>`}
      function exportMeetingsExcel(){
        ensureMeetings();
        const rows=meetingRows(),headers=["회의일","시간","회의 제목","주관자","참석자","현장/프로젝트","구분","회의 요약","결정사항"];
        const table=`<html><head><meta charset="utf-8"></head><body><table><thead><tr>${headers.map(h=>`<th style="border:1px solid #9fb6c1;background:#e7f6f8;padding:8px;">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(m=>`<tr>${[m.date,m.time,m.title,m.host,(m.attendees||[]).join(", "),m.project,m.type,m.summary,(m.decisions||[]).join("\n")].map(meetingExcelCell).join("")}</tr>`).join("")}</tbody></table></body></html>`;
        const blob=new Blob(["\ufeff"+table],{type:"application/vnd.ms-excel;charset=utf-8"});
        const a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download=`회의록_${today}.xls`;
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(a.href),1000);
        toast("회의록을 엑셀 파일로 내보냈습니다.");
      }
      function meetingA4Html(m){
        const decisions=(m.decisions||[]).length?(m.decisions||[]).map(x=>`<li>${esc(x)}</li>`).join(""):`<li>결정사항이 없습니다.</li>`;
        return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(m.title||"회의록")}</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;background:#eef2f4;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",Arial,sans-serif;color:#14212a}.sheet{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:18mm 16mm;box-shadow:0 18px 42px rgba(20,33,42,.18)}.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #087d8f;padding-bottom:12px;margin-bottom:14px}.brand{font-weight:900;color:#0a3d2b;font-size:20px}.doc-title{text-align:right}.doc-title h1{margin:0;font-size:28px}.doc-title p{margin:6px 0 0;color:#65737d}.grid{display:grid;grid-template-columns:28mm 1fr 28mm 1fr;border:1px solid #aebdc5;border-bottom:0;margin-bottom:14px}.grid div{border-bottom:1px solid #aebdc5;padding:8px;min-height:34px}.label{background:#eef8fa;font-weight:900;text-align:center}.section{border:1px solid #aebdc5;margin-bottom:14px}.section h2{font-size:15px;margin:0;background:#eef8fa;border-bottom:1px solid #aebdc5;padding:9px 10px}.section .body{padding:12px;line-height:1.75;min-height:42mm;white-space:pre-wrap}.section ul{margin:0;padding:12px 12px 12px 28px;line-height:1.8;min-height:42mm}.sign{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.sign div{border:1px solid #aebdc5;min-height:34mm;padding:10px}.sign strong{display:block;margin-bottom:18px}.toolbar{position:fixed;right:18px;top:18px;display:flex;gap:8px}.toolbar button{border:1px solid #d8e0e5;background:#087d8f;color:#fff;border-radius:8px;min-height:36px;padding:0 14px;font-weight:900}@media print{body{background:#fff}.sheet{box-shadow:none;width:auto;min-height:auto;margin:0;padding:0}.toolbar{display:none}}</style></head><body><div class="toolbar"><button onclick="window.print()">인쇄 / PDF 저장</button></div><main class="sheet"><div class="head"><div class="brand">KIWOOM</div><div class="doc-title"><h1>회의록</h1><p>${esc(m.date||today)} ${esc(m.time||"")}</p></div></div><div class="grid"><div class="label">회의명</div><div>${esc(m.title||"")}</div><div class="label">구분</div><div>${esc(m.type||"")}</div><div class="label">주관자</div><div>${esc(m.host||"")}</div><div class="label">현장/프로젝트</div><div>${esc(m.project||"")}</div><div class="label">참석자</div><div style="grid-column:span 3">${esc((m.attendees||[]).join(", "))}</div></div><section class="section"><h2>회의 요약</h2><div class="body">${esc(meetingPlainText(m.summary)||"")}</div></section><section class="section"><h2>결정사항</h2><ul>${decisions}</ul></section><div class="sign"><div><strong>작성</strong>${esc(loginName()||m.host||"")}</div><div><strong>확인</strong></div></div></main><script>setTimeout(()=>window.print(),350)<\/script></body></html>`;
      }
      function printSelectedMeetingA4(){
        const m=selectedMeeting();
        if(!m){toast("출력할 회의록이 없습니다.");return}
        const w=window.open("","_blank");
        if(!w){toast("팝업이 차단되어 A4 회의록을 열 수 없습니다.");return}
        w.document.open();
        w.document.write(meetingA4Html(m));
        w.document.close();
      }
      function renderMeetingDetail(m){
        if(!m)return `<div class="meeting-empty"><strong>등록된 회의록이 없습니다.</strong><span>회의록 추가 버튼으로 새 회의록을 작성할 수 있습니다.</span></div>`;
        return `<div class="meeting-detail"><div class="meeting-detail-head"><div><h2>${esc(m.title)}</h2><p>${esc(m.date)} ${esc(m.time)} · 주관 ${esc(m.host)} · ${esc(m.project)} / ${esc(m.type)}</p></div><div class="row-actions"><button class="btn" data-edit-meeting="${esc(m.id)}">수정</button><button class="btn" id="printMeetingA4Btn">A4 회의록</button><button class="btn subtle-danger" data-delete-meeting="${esc(m.id)}">삭제</button><button class="btn" id="addMeetingBtn">회의록 추가</button></div></div><div class="meeting-section"><h3>참석자</h3><div class="meeting-chips">${(m.attendees||[]).map(x=>`<span>${esc(x)}</span>`).join("")}</div></div><div class="meeting-section"><h3>회의 요약</h3><p>${esc(m.summary)}</p></div><div class="meeting-section"><h3>결정사항</h3><ul>${(m.decisions||[]).map(x=>`<li>${esc(x)}</li>`).join("")||`<li>결정사항이 없습니다.</li>`}</ul></div></div>`
      }
      function meetingFormPeopleOptions(){return (state.people||[]).map(p=>`<option>${esc(p.name)}</option>`).join("")||`<option>이재강</option>`}
      function renderMeetingAttendeeChecks(selected=[]){const names=(state.people||[]).map(p=>p.name);const picked=new Set((selected||[]).filter(Boolean));if(!picked.size){const fallback=loginName()||names[0]||"이재강";picked.add(fallback)}$("#meetingAttendees").innerHTML=(names.length?names:["이재강"]).map(name=>`<label><input type="checkbox" value="${esc(name)}" ${picked.has(name)?"checked":""}>${esc(name)}</label>`).join("")}
      function readMeetingAttendeeChecks(){const checked=Array.from($$("#meetingAttendees input:checked")).map(x=>x.value);return checked.length?checked:[$("#meetingHost")?.value||loginName()||"이재강"]}
      function meetingAiLabels(){return ["회의 제목","제목","회의일","날짜","일자","시간","회의 시간","주관자","주관","참석자","참석","현장/프로젝트","현장","프로젝트","구분","회의 구분","회의 요약","요약","결정사항","결정 사항"]}
      function meetingAiSection(text,label){
        const labels=meetingAiLabels().map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|");
        const re=new RegExp(`(?:^|\\n)\\s*(?:${label})\\s*[:：]\\s*([\\s\\S]*?)(?=\\n\\s*(?:${labels})\\s*[:：]|$)`,"i");
        const m=String(text||"").match(re);
        return m?m[1].trim():"";
      }
      function parseMeetingDate(v){const s=String(v||"").trim();let m=s.match(/(20\d{2})[-.\/\uB144\s]+(\d{1,2})[-.\/\uC6D4\s]+(\d{1,2})/);if(!m)m=s.match(/(\d{1,2})[-.\/\uC6D4\s]+(\d{1,2})/);if(m&&m.length===4)return `${m[1]}-${String(m[2]).padStart(2,"0")}-${String(m[3]).padStart(2,"0")}`;if(m&&m.length===3)return `${today.slice(0,4)}-${String(m[1]).padStart(2,"0")}-${String(m[2]).padStart(2,"0")}`;return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:""}
      function parseMeetingTime(v){const s=String(v||"").trim();let m=s.match(/(\uC624\uC804|\uC624\uD6C4|AM|PM)?\s*(\d{1,2})\s*[:\uC2DC]\s*(\d{1,2})?/i);if(!m)return"";let h=Number(m[2]),min=Number(m[3]||0),ap=(m[1]||"").toLowerCase();if((ap==="오후"||ap==="pm")&&h<12)h+=12;if((ap==="오전"||ap==="am")&&h===12)h=0;return `${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}`}
      function splitMeetingList(v){return String(v||"").split(/[,，·ㆍ\/\n]/).map(x=>x.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean)}
      function knownMeetingPeople(text){const raw=String(text||"");return (state.people||[]).map(p=>p.name).filter(name=>raw.includes(name))}
      function parseMeetingAiText(text){
        const get=(...labels)=>labels.map(l=>meetingAiSection(text,l)).find(Boolean)||"";
        const decisionsRaw=get("결정사항","결정 사항");
        const decisions=decisionsRaw?decisionsRaw.split(/\r?\n/).map(x=>x.replace(/^[-*•\d.)\s]+/,"").trim()).filter(Boolean):[];
        const attendees=splitMeetingList(get("참석자","참석")).filter(x=>(state.people||[]).some(p=>p.name===x));
        return {
          title:get("회의 제목","제목"),
          date:parseMeetingDate(get("회의일","날짜","일자")),
          time:parseMeetingTime(get("시간","회의 시간")),
          host:get("주관자","주관"),
          attendees:attendees.length?attendees:knownMeetingPeople(text),
          project:get("현장/프로젝트","현장","프로젝트"),
          type:get("구분","회의 구분"),
          summary:get("회의 요약","요약"),
          decisions
        }
      }
      function applyMeetingAiText(){
        const raw=$("#meetingAiText")?.value||"";
        if(!raw.trim()){toast("붙여넣은 회의 요약 내용이 없습니다.");return}
        const data=parseMeetingAiText(raw);
        if(data.title)$("#meetingTitle").value=data.title;
        if(data.date)$("#meetingDate").value=data.date;
        if(data.time)$("#meetingTime").value=data.time;
        if(data.host){$("#meetingHost").value=data.host;if($("#meetingHost").value!==data.host){const matched=(state.people||[]).find(p=>data.host.includes(p.name));if(matched)$("#meetingHost").value=matched.name}}
        if(data.type)$("#meetingType").value=data.type;
        if(data.attendees.length)renderMeetingAttendeeChecks(data.attendees);
        if(data.project)$("#meetingProject").value=data.project;
        if(data.summary)$("#meetingSummary").value=data.summary;
        if(data.decisions.length)$("#meetingDecisions").value=data.decisions.join("\n");
        toast("AI 요약 내용을 회의록에 자동 입력했습니다.");
      }

      // ── Gemini 음성 → 회의록 자동 작성 ──────────────────────────────
      async function uploadToGeminiFiles(file,key){
        const meta=JSON.stringify({file:{displayName:file.name}});
        const boundary="gemini_"+Date.now();
        const enc=new TextEncoder();
        const p1=enc.encode(`--${boundary}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${file.type||"audio/mpeg"}\r\n\r\n`);
        const p2=enc.encode(`\r\n--${boundary}--`);
        const fd=await file.arrayBuffer();
        const body=new Uint8Array(p1.byteLength+fd.byteLength+p2.byteLength);
        body.set(p1);body.set(new Uint8Array(fd),p1.byteLength);body.set(p2,p1.byteLength+fd.byteLength);
        const r=await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${encodeURIComponent(key)}&uploadType=multipart`,{method:"POST",headers:{"Content-Type":`multipart/related; boundary=${boundary}`},body});
        if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error?.message||`업로드 실패 (${r.status})`)}
        const d=await r.json();
        const uri=d.file?.uri;const name=d.file?.name?.split("/").pop();
        if(!uri)throw new Error("파일 URI를 받지 못했습니다.");
        // 파일 처리 대기
        for(let i=0;i<30;i++){
          const st=await fetch(`https://generativelanguage.googleapis.com/v1beta/files/${name}?key=${encodeURIComponent(key)}`);
          const sd=await st.json();
          if(sd.file?.state==="ACTIVE")return{uri,mimeType:sd.file.mimeType||file.type};
          if(sd.file?.state==="FAILED")throw new Error("파일 처리 실패 (Gemini)");
          await new Promise(res=>setTimeout(res,2000));
        }
        throw new Error("파일 처리 시간 초과");
      }

      async function transcribeAudioWithGemini(file){
        const key=(state.geminiKey||"").trim();
        if(!key){toast("관리자 설정 > Gemini API 키를 먼저 입력해주세요.");return null;}
        const statusEl=$("#meetingAudioStatus");
        const setStatus=(msg,col)=>{if(statusEl){statusEl.innerHTML=msg;statusEl.style.color=col||"#0d9488"}};
        const INLINE_LIMIT=19*1024*1024; // 19MB
        const prompt=`이 음성 파일은 업무 회의 녹음입니다. 내용을 분석하여 아래 JSON 형식으로 정확히 응답해주세요. JSON 이외의 텍스트는 절대 출력하지 마세요.\n{\n"title":"회의 제목 (5~15자)",\n"date":"${today}",\n"time":"HH:MM (모르면 빈 문자열)",\n"host":"주관자 이름 1명 (모르면 빈 문자열)",\n"type":"주간회의/현장점검/개선회의/업무보고/기타 중 하나",\n"attendees":["참석자1","참석자2"],\n"project":"현장 또는 프로젝트명 (모르면 일반업무)",\n"summary":"회의 핵심 내용 요약 3~5문장 (반드시 한국어)",\n"decisions":["결정사항1","결정사항2"]\n}`;
        try{
          let contentPart;
          if(file.size<=INLINE_LIMIT){
            setStatus("⏳ 음성 파일 읽는 중...");
            const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file)});
            contentPart={inlineData:{mimeType:file.type||"audio/mpeg",data:b64}};
          }else{
            setStatus("⏳ 대용량 파일 업로드 중... (잠시 기다려주세요)");
            const{uri,mimeType}=await uploadToGeminiFiles(file,key);
            contentPart={fileData:{mimeType,fileUri:uri}};
          }
          setStatus("🤖 Gemini AI 분석 중... (30초~1분 소요)");
          const resp=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[contentPart,{text:prompt}]}],generationConfig:{temperature:0.1}})});
          if(!resp.ok){const e=await resp.json().catch(()=>({}));throw new Error(e.error?.message||`API 오류 (${resp.status})`)}
          const data=await resp.json();
          const text=data.candidates?.[0]?.content?.parts?.[0]?.text||"";
          const jsonMatch=text.match(/\{[\s\S]*\}/);
          if(!jsonMatch)throw new Error("응답에서 JSON을 찾을 수 없습니다.");
          const result=JSON.parse(jsonMatch[0]);
          setStatus("✅ 분석 완료! 회의록이 자동으로 채워졌습니다.","#16a34a");
          return result;
        }catch(err){
          setStatus(`❌ 오류: ${err.message}`,"#ef4444");
          console.error("Gemini 음성 분석 오류:",err);
          return null;
        }
      }

      function applyMeetingTranscription(result){
        if(!result)return;
        if(result.title)$("#meetingTitle").value=result.title;
        if(result.date)$("#meetingDate").value=result.date;
        if(result.time)$("#meetingTime").value=result.time;
        if(result.host){$("#meetingHost").value=result.host;if($("#meetingHost").value!==result.host){const m=(state.people||[]).find(p=>result.host.includes(p.name));if(m)$("#meetingHost").value=m.name}}
        if(result.type)$("#meetingType").value=result.type;
        if(result.project)$("#meetingProject").value=result.project;
        if(result.summary)$("#meetingSummary").value=result.summary;
        if(result.decisions?.length)$("#meetingDecisions").value=result.decisions.join("\n");
        if(result.attendees?.length)renderMeetingAttendeeChecks(result.attendees);
        toast("🎤 음성 회의록이 자동으로 입력됐습니다!");
      }

      async function handleMeetingAudioFile(file){
        const btn=document.querySelector("label[for='meetingAudioInput']");
        if(btn){btn.style.pointerEvents="none";btn.style.opacity="0.6"}
        try{
          const result=await transcribeAudioWithGemini(file);
          if(result)applyMeetingTranscription(result);
        }finally{
          if(btn){btn.style.pointerEvents="";btn.style.opacity=""}
          const inp=$("#meetingAudioInput");if(inp)inp.value="";
        }
      }

      document.addEventListener("change",e=>{
        if(e.target.id==="meetingAudioInput"){
          const file=e.target.files?.[0];
          if(file)handleMeetingAudioFile(file);
        }
      },true);
      // ─────────────────────────────────────────────────────────────────

      function ensureMeetingModal(){
        if(!$("#meetingModalStyle"))document.head.insertAdjacentHTML("beforeend",`<style id="meetingModalStyle">
          .meeting-modal{width:min(820px,calc(100vw - 34px))}.meeting-modal textarea{min-height:92px}.meeting-modal .helper-grid{min-height:42px}.meeting-ai-box{border:1px dashed #b8d8de;background:#f5fbfc;border-radius:8px;padding:10px;margin:0 0 12px}.meeting-ai-box textarea{min-height:150px;margin-top:8px}.meeting-ai-actions{display:flex;gap:8px;align-items:center;justify-content:space-between}.meeting-ai-actions .meta{font-size:12px}.meeting-form-help{font-size:12px;color:var(--muted);line-height:1.55;margin-top:4px}.meeting-modal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.meeting-modal-grid .full{grid-column:1/-1}@media(max-width:720px){.meeting-modal-grid{grid-template-columns:1fr}.meeting-ai-actions{display:grid}}
        #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
        if($("#meetingModal"))return;
        document.body.insertAdjacentHTML("beforeend",`<div class="overlay" id="meetingModal"><div class="modal meeting-modal"><div class="modal-head"><h2 id="meetingModalTitle">회의록 추가</h2><button class="btn icon" data-close-meeting-modal>×</button></div><div class="meeting-modal-grid"><div class="form-row full"><label>회의 제목</label><input class="field" id="meetingTitle" placeholder="예: 주간 공무팀 업무회의"></div><div class="form-row"><label>회의일</label><input class="field" type="date" id="meetingDate"></div><div class="form-row"><label>시간</label><input class="field" type="time" id="meetingTime"></div><div class="form-row"><label>주관자</label><select id="meetingHost"></select></div><div class="form-row"><label>구분</label><input class="field" id="meetingType" placeholder="주간회의 / 현장점검 / 개선회의"></div><div class="form-row full"><label>참석자</label><div class="helper-grid" id="meetingAttendees"></div></div><div class="form-row full"><label>현장/프로젝트</label><input class="field" id="meetingProject" placeholder="일반업무 또는 현장명"></div><div class="form-row full"><label>회의 요약</label><textarea class="field" id="meetingSummary" placeholder="회의 핵심 내용을 입력하세요."></textarea></div><div class="form-row full"><label>결정사항</label><textarea class="field" id="meetingDecisions" placeholder="한 줄에 하나씩 입력"></textarea></div></div><div class="toolbar" style="margin-top:14px"><button class="btn primary" id="saveMeetingBtn">회의록 저장</button><button class="btn danger hidden" id="deleteMeetingBtn">삭제</button></div></div></div>`);
        $("#meetingModal .modal-head").insertAdjacentHTML("afterend",`<div class="meeting-ai-box"><div style="display:grid;gap:8px"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap"><span style="font-size:13px;font-weight:900;color:#0f172a">🎤 음성 파일 → 회의록 자동 작성</span><label class="btn primary" style="cursor:pointer;display:inline-flex;align-items:center;gap:5px;min-height:32px;padding:0 12px;font-size:12px" for="meetingAudioInput">파일 선택</label><input type="file" id="meetingAudioInput" accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm,.aac" style="display:none"></div><div id="meetingAudioStatus" style="font-size:12px;color:#64748b;line-height:1.5">MP3·M4A·WAV·OGG 파일 지원 · Gemini AI가 내용을 분석하여 아래 칸을 자동으로 채웁니다<br><span style="color:#94a3b8;font-size:11px">Gemini API 키는 관리자 설정에서 입력하세요 (Google AI Studio → 무료)</span></div></div><div style="border-top:1px dashed #cfe5e8;margin:10px 0"></div><div class="meeting-ai-actions"><button class="btn" id="toggleMeetingAiBtn" type="button">✏️ 텍스트로 자동 입력</button><span class="meta">요약문을 직접 붙여넣어 자동으로 채웁니다</span></div><div id="meetingAiPanel" class="hidden"><textarea class="field" id="meetingAiText" placeholder="Gemini가 정리한 회의록 텍스트를 여기에 붙여넣으세요.&#10;&#10;예)&#10;회의 제목: 주간 공무팀 업무회의&#10;회의일: 2026-06-05&#10;시간: 오전 9:00&#10;주관자: 이재강&#10;참석자: 이재강, 김현지&#10;현장/프로젝트: 일반업무&#10;회의 요약: ...&#10;결정사항:&#10;- ..."></textarea><div class="toolbar" style="margin-top:8px"><button class="btn primary" id="applyMeetingAiBtn" type="button">자동 입력</button><button class="btn" id="clearMeetingAiBtn" type="button">비우기</button></div></div></div>`);
        $("#saveMeetingBtn").onclick=e=>{e.preventDefault();saveMeetingFromModal()};
        $("#deleteMeetingBtn").onclick=e=>{e.preventDefault();deleteMeetingFromModal()};
      }
      function blankMeeting(){return {id:"",date:today,time:"09:00",title:"",host:loginName()||state.people?.[0]?.name||"이재강",attendees:[loginName()||state.people?.[0]?.name||"이재강"],project:"일반업무",type:"회의",summary:"",decisions:[]}}
      function fillMeetingModal(m=blankMeeting()){
        ensureMeetingModal();
        $("#meetingModal").dataset.editingId=m.id||"";
        $("#meetingModalTitle").textContent=m.id?"회의록 수정":"회의록 추가";
        $("#meetingTitle").value=m.title||"";
        $("#meetingDate").value=m.date||today;
        $("#meetingTime").value=m.time||"09:00";
        $("#meetingHost").innerHTML=meetingFormPeopleOptions();
        $("#meetingHost").value=m.host||state.people?.[0]?.name||"";
        $("#meetingType").value=m.type||"회의";
        renderMeetingAttendeeChecks(m.attendees||[]);
        $("#meetingProject").value=m.project||"일반업무";
        $("#meetingSummary").value=m.summary||"";
        $("#meetingDecisions").value=(m.decisions||[]).join("\n");
        $("#deleteMeetingBtn").classList.toggle("hidden",!m.id);
      }
      function readMeetingModal(){
        const id=$("#meetingModal").dataset.editingId||uid("meeting");
        return {id,date:$("#meetingDate").value||today,time:$("#meetingTime").value||"09:00",title:$("#meetingTitle").value.trim()||"제목 없는 회의록",host:$("#meetingHost").value,attendees:readMeetingAttendeeChecks(),project:$("#meetingProject").value.trim()||"일반업무",type:$("#meetingType").value.trim()||"회의",summary:$("#meetingSummary").value.trim(),decisions:$("#meetingDecisions").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)}
      }
      function openMeetingModal(m=null){$("#projectModal")?.classList.remove("open");fillMeetingModal(m||blankMeeting());$("#meetingModal").classList.add("open");setTimeout(()=>$("#meetingTitle")?.focus(),0)}
      function saveMeetingFromModal(){try{ensureMeetings();disableMeetingSamples();const m=readMeetingModal(),i=state.meetings.findIndex(x=>x.id===m.id);i>=0?state.meetings[i]=m:state.meetings.unshift(m);selectedMeetingId=m.id;$("#meetingModal").classList.remove("open");renderMeetingView();renderNav();updateTopButtons();saveStateAfterPaint("회의록을 저장했습니다.")}catch(err){console.error(err);toast(`회의록 저장 오류: ${err?.message||"확인 필요"}`)}}
      function deleteMeetingFromModal(){const id=$("#meetingModal").dataset.editingId;if(!id||!confirm("이 회의록을 삭제할까요?"))return;disableMeetingSamples();markDeleted("meetings",id);state.meetings=state.meetings.filter(m=>m.id!==id);selectedMeetingId=state.meetings[0]?.id||"";$("#meetingModal").classList.remove("open");saveState("회의록을 삭제했습니다.");render()}
      function renderMeetingView(){
        ensureMeetings();
        let view=$("#meetingView");
        if(!view){(els.fieldworkView||els.dbView||els.reportView||els.driveView||els.adminView).insertAdjacentHTML("afterend",`<section class="panel hidden" id="meetingView"></section>`);view=$("#meetingView");els.meetingView=view}
        if(!$("#meetingStyle"))document.head.insertAdjacentHTML("beforeend",`<style id="meetingStyle">
          #meetingView{box-shadow:none;background:transparent;border:0;padding:0}.meeting-shell{display:grid;grid-template-columns:320px minmax(0,1fr);gap:12px;align-items:start}.meeting-list,.meeting-detail{background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:10px}.meeting-list{max-height:calc(100vh - 185px);overflow:hidden;display:grid;grid-template-rows:auto minmax(0,1fr)}.meeting-list-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.meeting-list-head h2{font-size:15px;margin:0}.meeting-list-body{overflow:auto;padding-right:3px}.meeting-list-item{display:grid;grid-template-columns:minmax(0,1fr) 24px;gap:5px;align-items:center;margin-bottom:6px}.meeting-card{width:100%;text-align:left;border:1px solid var(--line);border-radius:6px;background:#fbfdfe;padding:8px;display:grid;gap:3px;min-height:0}.meeting-card.active{border-color:var(--teal);background:#eefbfc}.meeting-card strong{font-size:13px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.meeting-card span,.meeting-card em{font-style:normal;color:var(--muted);font-size:11px;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.meeting-delete-mini{width:22px;height:22px;border:1px solid #ffd2cc;border-radius:6px;background:#fff;color:#d44836;font-size:12px;font-weight:900;line-height:1;opacity:.7}.meeting-delete-mini:hover{opacity:1;background:#fff4f2}.meeting-detail{max-height:calc(100vh - 185px);overflow:auto}.meeting-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;border-bottom:1px solid var(--line);padding-bottom:9px}.meeting-detail h2{margin:0;font-size:18px;line-height:1.3}.meeting-detail p{line-height:1.5;margin:6px 0 0}.meeting-section{border-bottom:1px solid #edf1f3;padding:10px 0}.meeting-section:last-child{border-bottom:0}.meeting-section h3{font-size:13px;margin:0 0 7px}.meeting-section ul{margin:0;padding-left:17px;line-height:1.55}.meeting-chips{display:flex;flex-wrap:wrap;gap:5px}.meeting-chips span{border:1px solid var(--line);border-radius:999px;background:#f8fbfc;padding:4px 8px;font-weight:900;font-size:11px}.meeting-empty{background:#fff;border:1px solid var(--line);border-radius:8px;padding:18px;color:var(--muted);display:grid;gap:6px}.subtle-danger{color:#c93728;border-color:#ffd2cc;background:#fff}@media(max-width:900px){.meeting-shell{grid-template-columns:1fr}.meeting-list,.meeting-detail{max-height:none}.meeting-detail-head{display:grid}}
        #sharedNotice[data-sync="ok"]{border-color:#b7e2cf;background:#f7fffb}#sharedNotice[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff}#sharedNotice[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2}</style>`);
        const rows=meetingRows();
        view.innerHTML=`<div class="meeting-shell"><aside class="meeting-list"><div class="meeting-list-head"><h2>회의록</h2><span class="row-actions"><button class="btn" id="exportMeetingsExcelBtn">엑셀 추출</button><button class="btn" id="addMeetingBtnSide">회의록 추가</button></span></div><div class="meeting-list-body">${rows.map(meetingCard).join("")||`<div class="meeting-empty"><strong>등록된 회의록이 없습니다.</strong><span>새 회의록을 추가해 주세요.</span></div>`}</div></aside>${renderMeetingDetail(selectedMeeting())}</div>`;
      }
      const baseRenderViewForMeetings=renderView;
      renderView=function(){const isMeeting=currentView==="meetings";if(isMeeting)renderMeetingView();baseRenderViewForMeetings();if(els.meetingView)els.meetingView.classList.toggle("hidden",!isMeeting);if(isMeeting){$("#kpis")?.classList.add("hidden");els.dashboardView.classList.add("hidden");els.adminView.classList.add("hidden");els.mainGrid.classList.add("hidden");if(els.driveView)els.driveView.classList.add("hidden");if(els.reportView)els.reportView.classList.add("hidden");if(els.dbView)els.dbView.classList.add("hidden");if(els.fieldworkView)els.fieldworkView.classList.add("hidden");$("#sharedNotice")?.classList.add("hidden");document.body.classList.add("view-meetings")}}
      const baseRenderCurrentForMeetings=renderCurrentContent;
      renderCurrentContent=function(){if(currentView==="meetings"){syncViewChrome();renderMeetingView();return}baseRenderCurrentForMeetings()}
      const baseSyncForMeetings=syncViewChrome;
      syncViewChrome=function(){baseSyncForMeetings();if(currentView==="meetings"){els.pageTitle.textContent="회의록";els.pageSub.textContent="회의 내용과 결정사항을 기록합니다.";$("#addProjectBtn").textContent="회의록 추가"}}
      function deleteMeetingById(id){if(!id||!confirm("이 회의록을 삭제할까요?"))return;disableMeetingSamples();markDeleted("meetings",id);state.meetings=state.meetings.filter(m=>m.id!==id);selectedMeetingId=state.meetings[0]?.id||"";saveState("회의록을 삭제했습니다.");render()}
      document.addEventListener("click",e=>{const t=e.target.closest("button")||e.target;if(t.dataset.meetingId){e.preventDefault();e.stopImmediatePropagation();selectedMeetingId=t.dataset.meetingId;renderMeetingView();return}if(t.dataset.deleteMeeting){e.preventDefault();e.stopImmediatePropagation();deleteMeetingById(t.dataset.deleteMeeting);return}if(t.id==="exportMeetingsExcelBtn"){e.preventDefault();e.stopImmediatePropagation();exportMeetingsExcel();return}if(t.id==="printMeetingA4Btn"){e.preventDefault();e.stopImmediatePropagation();printSelectedMeetingA4();return}if(t.id==="addMeetingBtn"||t.id==="addMeetingBtnSide"||currentView==="meetings"&&t.id==="addProjectBtn"){e.preventDefault();e.stopImmediatePropagation();openMeetingModal();return}if(t.dataset.editMeeting){e.preventDefault();e.stopImmediatePropagation();const m=state.meetings.find(x=>x.id===t.dataset.editMeeting);if(m)openMeetingModal(m);return}if(t.id==="toggleMeetingAiBtn"){e.preventDefault();e.stopImmediatePropagation();$("#meetingAiPanel")?.classList.toggle("hidden");return}if(t.id==="applyMeetingAiBtn"){e.preventDefault();e.stopImmediatePropagation();applyMeetingAiText();return}if(t.id==="clearMeetingAiBtn"){e.preventDefault();e.stopImmediatePropagation();$("#meetingAiText").value="";$("#meetingAiText").focus();return}if(t.id==="saveMeetingBtn"){e.preventDefault();e.stopImmediatePropagation();saveMeetingFromModal();return}if(t.id==="deleteMeetingBtn"){e.preventDefault();e.stopImmediatePropagation();deleteMeetingFromModal();return}if(t.dataset.closeMeetingModal!==undefined||e.target?.id==="meetingModal"){e.preventDefault();e.stopImmediatePropagation();$("#meetingModal")?.classList.remove("open");return}},true);
    })();
    function staffAccess(p){return p?.accessRole||p?.authRole||p?.permissionRole||(p?.isAdmin?"admin":"")||(p?.name==="이재강"?"admin":"member")}
    function setStaffAccess(p,role){p.accessRole=role==="admin"?"admin":"member";delete p.email;delete p.googleEmail;delete p.authEmail}
    function currentStaff(){const name=loginName();return (state.people||[]).find(p=>p.name===name)}
    function isCurrentAdminUser(){return staffAccess(currentStaff())==="admin"}
    function navAccess(n){return n?.accessRole||n?.access||n?.permission||(n?.adminOnly?"admin":"")||(String(n?.label||"").includes("관리자")?"admin":"member")}
    function setNavAccess(n,role){n.access=role==="admin"?"admin":"member";n.adminOnly=n.access==="admin"}
    function canAccessNav(n){return navAccess(n)!=="admin"||isCurrentAdminUser()}
    function normalizePermissionState(){state.people=(state.people||[]).map(p=>{if(!staffAccess(p))p.accessRole=p.name==="이재강"?"admin":"member";else p.accessRole=staffAccess(p);delete p.email;delete p.googleEmail;delete p.authEmail;return p});state.nav=(state.nav||[]).map(n=>{if(!n.access)n.access=navAccess(n);n.adminOnly=n.access==="admin";return n})}
    const baseNormalizeForPermissions=normalizeState;
    normalizeState=function(){baseNormalizeForPermissions();normalizePermissionState()}
    const baseRenderNavForPermissions=renderNav;
    renderNav=function(){normalizePermissionState();els.nav.innerHTML=state.nav.map((n,i)=>canAccessNav(n)?`<button class="nav-btn ${isActive(n.label)?"active":""}" data-nav="${i}"><span>${esc(n.icon)}</span><span>${esc(n.label)}</span></button>`:"").join("")}
    const baseGoToViewForPermissions=goToView;
    goToView=function(view,label=""){const n=state.nav.find(x=>x.label===label)||state.nav.find(x=>viewForLabel(x.label)===view);if(n&&!canAccessNav(n)){toast("관리자 권한이 필요한 카테고리입니다.");return}baseGoToViewForPermissions(view,label)}
    unlockAdmin=function(){if(isCurrentAdminUser()){adminUnlocked=true;sessionStorage.setItem(adminUnlockKey,"true");sessionStorage.setItem(adminOwnerKey,loginName());updateTopButtons();return true}adminUnlocked=false;sessionStorage.removeItem(adminUnlockKey);sessionStorage.removeItem(adminOwnerKey);toast("관리자로 지정된 직원만 접근할 수 있습니다.");return false}
    const baseUpdateTopButtonsForPermissions=updateTopButtons;
    updateTopButtons=function(){adminUnlocked=isCurrentAdminUser();baseUpdateTopButtonsForPermissions();renderLoginInfo()}
    renderAuthAdminCard=function(){
      normalizePermissionState();
      const siteUrl=location.origin+location.pathname;
      const rows=(state.people||[]).map((p,i)=>`
        <div class="auth-row" style="flex-wrap:wrap;gap:8px;align-items:center">
          <div style="min-width:120px"><strong>${esc(p.name)}</strong><div class="meta">${esc(p.role||"직원")}</div></div>
          <span class="row-actions" style="flex-wrap:wrap;gap:6px">
            <input class="field" data-admin-person-pin="${i}" value="${esc(staffPin(p)||"1234")}" placeholder="개인 PIN" style="width:90px;min-height:30px">
            <select class="field" data-admin-person-access="${i}" style="width:110px;min-height:30px">
              <option value="member" ${staffAccess(p)==="admin"?"":"selected"}>팀원</option>
              <option value="admin" ${staffAccess(p)==="admin"?"selected":""}>관리자</option>
            </select>
            <button class="btn" data-pin-kakao="${esc(p.name)}" style="min-height:30px;padding:0 8px;font-size:11px">📱 카톡</button>
          </span>
        </div>`).join("");

      return`<div class="card" id="authAdminCard">
        <div class="panel-title">
          <h2>👥 팀원 PIN · 권한</h2>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn primary" id="pinGuideAllBtn" style="font-size:12px">📋 전체 안내 카톡</button>
            <button class="btn" id="morningBriefingPreviewBtn" style="font-size:12px">🌅 브리핑 미리보기</button>
          </div>
        </div>
        <div style="font-size:12px;color:#71806f;margin-bottom:10px;padding:8px 10px;background:#f4faf8;border-radius:8px;line-height:1.6">
          📌 <strong>${esc(siteUrl)}</strong><br>PIN 변경 후 Enter 누르면 자동 저장됩니다.
        </div>
        <div class="auth-list">${rows||`<div class="meta">직원이 없습니다</div>`}</div>
      </div>`;
    }
    function permissionNavHtml(){return state.nav.map((n,i)=>`<div class="admin-item" style="grid-template-columns:48px minmax(150px,1fr) 130px auto auto auto"><input class="field" data-admin-nav-icon="${i}" value="${esc(n.icon)}"><input class="field" data-admin-nav-label="${i}" value="${esc(n.label)}"><select class="field" data-admin-nav-access="${i}"><option value="member" ${navAccess(n)==="admin"?"":"selected"}>팀원 이상</option><option value="admin" ${navAccess(n)==="admin"?"selected":""}>관리자 전용</option></select><button class="btn icon" data-move-admin-nav="${i}" data-dir="-1" ${i===0?"disabled":""}>&uarr;</button><button class="btn icon" data-move-admin-nav="${i}" data-dir="1" ${i===state.nav.length-1?"disabled":""}>&darr;</button><button class="btn icon danger" data-delete-admin-nav="${i}">&times;</button></div>`).join("")}
    function enhancePermissionAdminUi(){normalizePermissionState();const grid=$("#adminView .admin-grid"),old=$("#authAdminCard");if(old)old.outerHTML=renderAuthAdminCard();else if(grid)grid.insertAdjacentHTML("afterbegin",renderAuthAdminCard());const navCard=[...$$("#adminView .admin-grid .card")].find(card=>card.querySelector("h2")?.textContent.trim()==="메뉴 카테고리");const list=navCard?.querySelector(".admin-list");if(list)list.innerHTML=permissionNavHtml()}
    const baseRenderAdminForPermissions=renderAdmin;
    renderAdmin=function(){baseRenderAdminForPermissions();enhancePermissionAdminUi()}
    function guardPermissionView(){const n=state.nav.find(x=>viewForLabel(x.label)===currentView);if((currentView==="admin"||(n&&navAccess(n)==="admin"))&&!isCurrentAdminUser()){currentView="dashboard";localStorage.setItem(viewStorageKey,currentView);toast("관리자 전용 카테고리는 관리자만 볼 수 있습니다.")}}
    const baseRenderForPermissionGuard=render;
    render=function(){normalizePermissionState();guardPermissionView();baseRenderForPermissionGuard()}
    document.addEventListener("change",e=>{const t=e.target;if(t.dataset.adminPersonAccess!==undefined){const p=state.people[Number(t.dataset.adminPersonAccess)];if(p){const adminCount=state.people.filter(x=>staffAccess(x)==="admin").length;if(staffAccess(p)==="admin"&&t.value!=="admin"&&adminCount<=1){toast("마지막 관리자는 팀원으로 변경할 수 없습니다.");t.value="admin";return}setStaffAccess(p,t.value);saveState("직원 권한을 저장했습니다.");render()}}if(t.dataset.adminNavAccess!==undefined){const n=state.nav[Number(t.dataset.adminNavAccess)];if(n){setNavAccess(n,t.value);saveState("카테고리 권한을 저장했습니다.");render()}}},true);
    document.addEventListener("click",e=>{
      const t=e.target.closest("button");
      if(!t||!["adminTopBtn","googleLogoutBtn","exportBtn"].includes(t.id))return;
      pulseTopButton(t,t.id==="exportBtn"?"내보내기를 준비합니다.":t.id==="adminTopBtn"?"관리자 화면을 엽니다.":"로그아웃합니다.");
    },true);
    document.addEventListener("click",async e=>{
      const t=e.target.closest("button")||e.target;
      if(t.id==="forceSheetUploadBtn"||t.id==="sheetSyncFloatBtn"){e.preventDefault();clearTimeout(syncSaveTimer);state.__updatedAt=Date.now();pushSharedState();toast("최신 내용을 즉시 동기화합니다.");return}
      if(t.id==="checkSheetLoadBtn"){e.preventDefault();loadSharedState(false,true);toast("Supabase에서 최신 내용을 강제로 불러옵니다.");return}
      if(t.id==="staffLoginBtn"){e.preventDefault();staffLogin();return}
      if(t.id==="googleLogoutBtn"){e.preventDefault();clearStaffSession();await signOutAuth("다른 직원으로 다시 로그인해주세요.");fillStaffLoginNames();return}
      if(t.id==="reloadLatestBtn"){e.preventDefault();const version=$("#appUpdateNotice")?.dataset.latestVersion||Date.now();location.href=`${location.origin}${location.pathname}?v=${encodeURIComponent(version)}`;return}
      if(t.id==="dismissUpdateBtn"){e.preventDefault();const version=$("#appUpdateNotice")?.dataset.latestVersion;if(version)localStorage.setItem("dismissed-app-version",version);$("#appUpdateNotice")?.classList.add("hidden");return}
      /* ── PIN 카톡 안내 버튼 (data-pin-kakao) ── */
      if(t.dataset.pinKakao){
        const name=t.dataset.pinKakao;
        const person=(state.people||[]).find(p=>p.name===name);
        if(!person)return;
        const pin=staffPin(person)||"1234";
        const siteUrl=location.origin+location.pathname;
        const msg=`안녕하세요 ${person.name} ${person.role||""}님!\n\n기술지원팀 업무관리 사이트를 이용해 주세요.\n\n🔗 접속 주소: ${siteUrl}\n👤 이름: ${person.name}\n🔑 개인 PIN: ${pin}\n\n스마트폰, 노트북 모두 사용 가능합니다 😊`;
        const box=document.getElementById("kakaoTodoText");
        if(box){box.value=msg;document.getElementById("kakaoTodoModal")?.classList.add("open")}
        else{navigator.clipboard?.writeText(msg);toast(`${person.name} 안내문 복사됨`)}
        return;
      }
      /* ── 전체 안내문 카톡 ── */
      if(t.id==="pinGuideAllBtn"){
        const siteUrl=location.origin+location.pathname;
        const allMsg=(state.people||[]).map(p=>`• ${p.name} (${p.role||"직원"}): PIN ${staffPin(p)||"1234"}`).join("\n");
        const guide=`[기술지원팀 업무관리 안내]\n\n접속주소: ${siteUrl}\n\n${allMsg}\n\n위 PIN으로 로그인하세요 😊`;
        const box=document.getElementById("kakaoTodoText");
        if(box){box.value=guide;document.getElementById("kakaoTodoModal")?.classList.add("open")}
        else{navigator.clipboard?.writeText(guide);toast("전체 안내문 복사됨")}
        return;
      }
      /* ── 모닝 브리핑 미리보기 ── */
      if(t.id==="morningBriefingPreviewBtn"){
        window.openMorningBriefing&&window.openMorningBriefing();
        return;
      }
    },true);
    document.addEventListener("keydown",e=>{
      if(e.key!=="Enter")return;
      const target=e.target;
      if(!target||!["staffLoginName","staffLoginPin"].includes(target.id))return;
      const btn=$("#staffLoginBtn");
      if(btn?.disabled)return;
      e.preventDefault();
      staffLogin();
    },true);
    (function lockPreferredNavOrder(){
      const preferredNavOrder=["대시보드","할일관리","외근현황","메세지","보고서","회의록","시공일정","DB","프로젝트 파일","MW","구조물 검수","관리자"];
      const preferredNavDefaults={
        "대시보드":{icon:"⌂",label:"대시보드",access:"member"},
        "할일관리":{icon:"☑",label:"할일관리",access:"member"},
        "외근현황":{icon:"⌖",label:"외근현황",access:"member"},
        "메세지":{icon:"✉",label:"메세지",access:"member"},
        "보고서":{icon:"▣",label:"보고서",access:"member"},
        "회의록":{icon:"▤",label:"회의록",access:"member"},
        "시공일정":{icon:"◉",label:"시공일정",access:"admin"},
        "DB":{icon:"▦",label:"DB",access:"admin"},
        "프로젝트 파일":{icon:"▤",label:"프로젝트 파일",access:"admin"},
        "MW":{icon:"▣",label:"MW",access:"admin",accessRole:"admin",adminOnly:true},
        "구조물 검수":{icon:"◉",label:"구조물 검수",access:"member"},
        "관리자":{icon:"⚙",label:"관리자",access:"admin"}
      };
      function preferredNavLabel(label){
        const compact=String(label||"").replace(/\s/g,"");
        if(compact==="프로젝트파일")return "프로젝트 파일";
        return preferredNavOrder.find(x=>x.replace(/\s/g,"")===compact)||label;
      }
      function applyPreferredNavOrder(){
        if(!Array.isArray(state.nav))state.nav=[];
        const hidden=Array.isArray(state.hiddenNavLabels)?state.hiddenNavLabels.map(h=>preferredNavLabel(h)):[];
        const current=state.nav.map(n=>({...n,label:preferredNavLabel(n.label)}));
        state.nav=preferredNavOrder.filter(label=>!hidden.includes(label)).map(label=>current.find(n=>n.label===label)||{...preferredNavDefaults[label]});
        normalizePermissionState?.();
        if(currentView==="projects"||currentView==="assignments"){
          currentView="todos";
          localStorage.setItem(viewStorageKey,currentView);
        }
      }
      const baseNormalizeForPreferredNav=normalizeState;
      normalizeState=function(){baseNormalizeForPreferredNav();applyPreferredNavOrder()};
      applyPreferredNavOrder();
    })();
    (function setupOnlinePresence(){
      const presenceDeviceKey="solar-presence-device-id-v1";
      const presenceTtlMs=2*60*1000;
      const staleKeepMs=24*60*60*1000;
      let presenceTimer=null,presenceSaving=false,presencePending=false;
      function presenceDeviceId(){
        let id=localStorage.getItem(presenceDeviceKey);
        if(!id){id=uid("presence");localStorage.setItem(presenceDeviceKey,id)}
        return id;
      }
      function presenceViewLabel(){
        const found=(state.nav||[]).find(n=>viewForLabel(n.label)===currentView);
        return found?.label||els.pageTitle?.textContent||currentView||"화면";
      }
      function presenceRows(){
        state.onlineUsers=Array.isArray(state.onlineUsers)?state.onlineUsers:[];
        const now=Date.now();
        state.onlineUsers=state.onlineUsers.filter(u=>u&&u.id&&u.name&&now-Number(u.lastSeen||0)<staleKeepMs);
        return state.onlineUsers;
      }
      function activePresenceRows(){
        const now=Date.now();
        return presenceRows().map(u=>({...u,online:now-Number(u.lastSeen||0)<=presenceTtlMs&&u.status!=="offline"})).sort((a,b)=>Number(b.lastSeen||0)-Number(a.lastSeen||0));
      }
      function currentPresencePayload(status="online"){
        const person=currentStaff?.(),name=loginName();
        if(!name)return null;
        return {id:presenceDeviceId(),name,role:person?.role||"직원",access:staffAccess?.(person)||"member",status,view:presenceViewLabel(),lastSeen:Date.now(),lastSeenText:new Date().toLocaleString("ko-KR"),userAgent:navigator.userAgent.slice(0,120)};
      }
      async function pushPresenceSilently(){
        if(presenceSaving){presencePending=true;return}
        presenceSaving=true;
        try{
          /* app_config만 업데이트 (개별 테이블 건드리지 않음) → 삭제된 항목 재삽입 방지 */
          const h=supabaseHeaders({Prefer:"resolution=merge-duplicates,return=minimal"});
          const cfgRes=await fetch(`${SUPABASE_URL}/rest/v1/app_config?id=eq.main&select=data`,{cache:"no-store",headers:supabaseHeaders()}).catch(()=>null);
          if(cfgRes?.ok){
            const cfgRows=await cfgRes.json().catch(()=>[]);
            const existingCfg=cfgRows[0]?.data||{};
            const mergedCfg={...existingCfg,onlineUsers:Array.isArray(state.onlineUsers)?state.onlineUsers:[],__presenceUpdatedAt:state.__presenceUpdatedAt};
            await fetch(`${SUPABASE_URL}/rest/v1/app_config`,{method:"POST",headers:h,body:JSON.stringify({id:"main",data:mergedCfg,updated_at:new Date().toISOString()})});
          }
        }catch{}
        presenceSaving=false;
        if(presencePending){presencePending=false;setTimeout(pushPresenceSilently,600)}
      }
      function upsertPresence(status="online",sync=true){
        const payload=currentPresencePayload(status);
        if(!payload)return;
        const rows=presenceRows().filter(u=>u.id!==payload.id);
        const previous=state.onlineUsers.find(u=>u.id===payload.id);
        state.onlineUsers=[{...previous,...payload,loginAt:previous?.loginAt||Date.now()},...rows];
        state.__presenceUpdatedAt=Date.now();
        localStorage.setItem(storageKey,JSON.stringify(state));
        renderPresenceUi();
        if(sync)pushPresenceSilently();
      }
      function markOffline(){
        if(!loginName())return;
        upsertPresence("offline",false);
        try{
          if(state.__pendingCloudSync)saveToSupabase({keepalive:true}).catch(()=>{});
        }catch{}
      }
      function schedulePresenceTouch(delay=700){
        clearTimeout(presenceTimer);
        presenceTimer=setTimeout(()=>upsertPresence("online",true),delay);
      }
      function syncPresenceAfterLoad(){
        if(!authReady||!loginName())return;
        upsertPresence("online",true);
      }
      function relativePresenceTime(ts){
        const diff=Math.max(0,Date.now()-Number(ts||0));
        if(diff<60000)return "방금 전";
        if(diff<3600000)return `${Math.floor(diff/60000)}분 전`;
        return `${Math.floor(diff/3600000)}시간 전`;
      }
      function presenceCardHtml(){
        const rows=activePresenceRows(),online=rows.filter(u=>u.online);
        return `<div class="card" id="onlinePresenceCard"><div class="panel-title"><h2>접속자 현황</h2><span class="badge green">접속중 ${online.length}명</span></div><div class="meta" style="margin:8px 0 12px">2분 안에 신호가 있으면 접속중으로 표시합니다. 브라우저를 강제 종료하면 잠시 뒤 오프라인으로 바뀝니다.</div><div class="admin-list">${rows.length?rows.map(u=>`<div class="auth-row online-row ${u.online?"is-online":"is-offline"}"><div><strong>${esc(u.name)}</strong><div class="meta">${esc(u.role||"직원")} · ${esc(u.view||"화면")} · ${relativePresenceTime(u.lastSeen)}</div></div><span class="badge ${u.online?"green":"amber"}">${u.online?"접속중":"오프라인"}</span></div>`).join(""):`<div class="meta">아직 접속 기록이 없습니다.</div>`}</div></div>`;
      }
      function renderPresenceUi(){
        const rows=activePresenceRows(),online=rows.filter(u=>u.online);
        const box=$("#loginInfo");
        if(box&&loginName()){
          box.title=online.length?`현재 접속중: ${online.map(u=>u.name).join(", ")}`:"접속자 확인 중";
          if(!$("#onlineCountBadge"))box.insertAdjacentHTML("beforeend",`<span class="role" id="onlineCountBadge"> · 접속중 ${online.length}명</span>`);
          else $("#onlineCountBadge").textContent=` · 접속중 ${online.length}명`;
        }
        const card=$("#onlinePresenceCard"),grid=$("#adminView .admin-grid");
        if(card)card.outerHTML=presenceCardHtml();
        else if(grid&&currentView==="admin")grid.insertAdjacentHTML("afterbegin",presenceCardHtml());
      }
      window.renderPresenceUi=renderPresenceUi;
      const baseSetStaffSessionForPresence=setStaffSession;
      setStaffSession=function(person){baseSetStaffSessionForPresence(person);schedulePresenceTouch(200)};
      const baseClearStaffSessionForPresence=clearStaffSession;
      clearStaffSession=function(){markOffline();baseClearStaffSessionForPresence()};
      const baseLoadSharedStateForPresence=loadSharedState;
      loadSharedState=async function(silent=false){const result=await baseLoadSharedStateForPresence(silent);syncPresenceAfterLoad();return result};
      const baseRenderLoginInfoForPresence=renderLoginInfo;
      renderLoginInfo=function(){baseRenderLoginInfoForPresence();renderPresenceUi()};
      const baseRenderAdminForPresence=renderAdmin;
      renderAdmin=function(){baseRenderAdminForPresence();renderPresenceUi()};
      const baseGoToViewForPresence=goToView;
      goToView=function(view,label=""){baseGoToViewForPresence(view,label);schedulePresenceTouch(500)};
      window.addEventListener("beforeunload",markOffline);
      document.addEventListener("visibilitychange",()=>{if(document.hidden)markOffline();else schedulePresenceTouch(300)});
      setInterval(()=>{if(authReady&&loginName()&&!document.hidden)schedulePresenceTouch(100)},45000);
    })();
    document.addEventListener("keydown",e=>{if(e.key==="Escape")$$(".overlay").forEach(m=>m.classList.remove("open"))});
    window.addEventListener("beforeunload",()=>{if(syncSaveTimer||state.__pendingCloudSync){clearTimeout(syncSaveTimer);state.__updatedAt=Date.now();state.__lastSavedAt=new Date().toISOString();state.__lastSavedAtText=new Date().toLocaleString("ko-KR");localStorage.setItem(storageKey,JSON.stringify(state));saveToSupabase({keepalive:true}).catch(()=>{})}});
    document.addEventListener("visibilitychange",()=>{if(!document.hidden&&authReady){loadSharedState(true);checkAppVersion()}});
    /* 5초마다 폴링 (팀원 변경사항 빠르게 반영) */
    setInterval(()=>{if(!document.hidden&&authReady)loadSharedState(true)},5000);
    setInterval(()=>{if(!document.hidden)checkAppVersion()},180000);
    setInterval(updateClock,30000);
    initAuthGate();
    setTimeout(checkAppVersion,2500);
  

    /* EPC 손익 대시보드 통합 */
    ;(() => {
      /* EPC seed data loaded from epc_data.js */

      const epcSeedData = window.SOLAR_EPC_DATA;
      const epcData = JSON.parse(JSON.stringify(epcSeedData));
      const epcState = { query: "", status: "", risk: "", sort: "risk", selectedId: null, composing: false };
      let epcSearchTimer = null;

      function epcNum(value) {
        if (value == null) return 0;
        if (typeof value === "number") return Number.isFinite(value) ? value : 0;
        const text = String(value).replace(/[^0-9.\-]/g, "");
        const n = Number(text);
        return Number.isFinite(n) ? n : 0;
      }

      function epcKeySlug(value) {
        return String(value || "").replace(/[\s_\/\-.()]/g, "").toLowerCase();
      }

      function epcFirst(row, keys) {
        const entries = Object.entries(row || {});
        for (const key of keys) {
          const direct = row?.[key];
          if (direct !== undefined && direct !== null && String(direct).trim() !== "") return direct;
          const slug = epcKeySlug(key);
          const found = entries.find(([rowKey, value]) => epcKeySlug(rowKey) === slug && value !== undefined && value !== null && String(value).trim() !== "");
          if (found) return found[1];
        }
        return "";
      }

      function epcFirstNum(row, keys) {
        for (const key of keys) {
          const n = epcNum(epcFirst(row, [key]));
          if (n) return n;
        }
        return 0;
      }

      function epcRegion(address) {
        const parts = String(address || "").trim().split(/\s+/).filter(Boolean);
        return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : (parts[0] || "지역 미입력");
      }

      function epcProjectFromDbRow(row, index) {
        const payments = ["계약금","잔금1","잔금2","잔금3","잔금4","잔금5","키움수금액"].reduce((s,k)=>s+epcNum(row[k]),0);
        let revenue = epcFirstNum(row, ["공사금액공급가","재무신규공급가","재무상품서비스금액"]);
        if (!revenue) revenue = payments;
        const costKeys = ["발주모듈금액","발주인버터금액","발주분전함금액","발주구조물금액","구조물시공비","전기시공금액","보강비","전기설계감리비","모니터링설치비","사용전검사비","실측장비대","장비대지게차금액","장비대크레인금액","구조검토비1","구조검토비2","구조검토비3","모듈선금액","모듈잔금액","인버터선금액","인버터잔금액","키움강판","키움철강","키움장비료","키움인건비","키움잡자재비","계약수수료","완납수수료","지사수수료1","지사수수료2","산하수수료"];
        const cost = costKeys.reduce((s,k)=>s+epcNum(row[k]),0);
        const profit = revenue - cost;
        let unpaid = epcNum(row.재무미수잔액);
        if (!unpaid && revenue) unpaid = Math.max(revenue - payments, 0);
        const status = String(epcFirst(row, ["진행상태","진행중"]) || "상태 미입력");
        const stageMap = [
          ["발전허가","발전허가일",["발전완료"]],
          ["개발행위","개발허가일",["개발완료"]],
          ["PPA","PPA접수증수령일",["PPA완료"]],
          ["구조물","구조물생산완료일",["구조물완료","구조물입고완료"]],
          ["공사계획","공사계획허가일",["행정사업개시완료"]],
          ["사용전검사","사용전검사일",["행정준공완료"]],
          ["상업운전","상업운전개시일",["수급계약완료"]],
          ["설비등록","설비완료일자",["설비등록완료"]]
        ];
        const isDoneText = value => {
          const text = String(value || "").trim();
          return !!text && !["미완료","대기","대기중","진행중","보류","취소"].includes(text);
        };
        const projectCompleted = status.includes("공사완료") || status === "완료";
        const impliedDoneStages = (() => {
          if (projectCompleted) return stageMap.map(([label]) => label);
          if (status.includes("공사중")) return ["발전허가","개발행위","PPA","공사계획"];
          if (status.includes("공사준비")) return ["발전허가","개발행위","PPA","공사계획"];
          if (status.includes("선로대기")) return ["발전허가","개발행위"];
          return [];
        })();
        const missingStages = projectCompleted ? [] : stageMap
          .filter(([label,key,alts]) => !impliedDoneStages.includes(label) && !isDoneText(epcFirst(row, [key])) && !(alts || []).some(alt => isDoneText(epcFirst(row, [alt]))))
          .map(([label]) => label);
        const risk = [];
        if (status === "공사완료" && unpaid > 0) risk.push("완료 후 미수");
        if (revenue === 0 && cost > 0) risk.push("원가 선투입");
        if (revenue > 0 && profit / revenue < 0.08) risk.push("저마진");
        if (status === "선로대기중" || status === "보류중") risk.push("장기대기");
        if (status !== "취소" && status !== "공사완료" && missingStages.length >= 5) risk.push("공정누락");
        return {
          id: index + 1,
          plant: String(epcFirst(row, ["발전소명"]) || `발전소 ${index + 1}`),
          corp: String(epcFirst(row, ["계약법인"]) || "미입력"),
          type: String(epcFirst(row, ["건립종류"]) || "미입력"),
          manager: String(epcFirst(row, ["영업담당자","영업 담당자"]) || "미입력"),
          region: epcRegion(epcFirst(row, ["현장주소","현장 주소"])),
          status,
          contractDate: String(row.계약일 || "").slice(0, 10),
          capacity: epcFirstNum(row, ["공사용량","공사_용량","발전허가용량","발전_허가용량","공사계획허가용량","공사계획_허가용량"]),
          revenue: Math.round(revenue),
          payments: Math.round(payments),
          unpaid: Math.round(unpaid),
          cost: Math.round(cost),
          profit: Math.round(profit),
          margin: revenue ? Number((profit / revenue).toFixed(4)) : null,
          completedStages: stageMap.length - missingStages.length,
          totalStages: stageMap.length,
          missingStages,
          risk,
          ppaLine: String(row.PPA선로확보여부 || "미입력"),
          inspection: String(row.검사합격여부 || "미입력"),
        };
      }

      function epcApplySharedDb() {
        const rows = window.solarDb?.rows?.() || [];
        if (!rows.length) {
          if (epcData.__sharedSignature) Object.assign(epcData, JSON.parse(JSON.stringify(epcSeedData)));
          epcData.__sharedSignature = "";
          return false;
        }
        const dbInfo = state.businessDb || {};
        const signature = `${rows.length}|${dbInfo.cloudSavedAt || dbInfo.updatedAt || ""}|${dbInfo.fileName || ""}`;
        if (epcData.__sharedSignature === signature) return true;
        const projects = rows.map(epcProjectFromDbRow);
        const statusCounts = {};
        const corpCounts = {};
        projects.forEach(p => {
          statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
          corpCounts[p.corp] = (corpCounts[p.corp] || 0) + 1;
        });
        epcData.generatedAt = new Date().toISOString().slice(0, 10);
        epcData.source = state.businessDb?.fileName || "공유 DB";
        epcData.statusCounts = statusCounts;
        epcData.corpCounts = corpCounts;
        epcData.projects = projects;
        epcData.__sharedSignature = signature;
        epcData.summary = {
          projectCount: projects.length,
          totalCapacity: projects.reduce((s,p)=>s+p.capacity,0),
          totalRevenue: projects.reduce((s,p)=>s+p.revenue,0),
          totalPayments: projects.reduce((s,p)=>s+p.payments,0),
          totalUnpaid: projects.reduce((s,p)=>s+p.unpaid,0),
          totalCost: projects.reduce((s,p)=>s+p.cost,0),
          totalProfit: projects.reduce((s,p)=>s+p.profit,0),
          riskCount: projects.filter(p=>p.risk.length).length,
          lossCount: projects.filter(p=>p.profit<0).length,
        };
        return true;
      }

      function epcEnsureNav() {
        state.nav = Array.isArray(state.nav) ? state.nav : [];
        const existing = state.nav.find(n => String(n.label || "").includes("EPC 손익") || String(n.label || "") === "MW");
        if (existing) {
          existing.icon = "▣";
          existing.label = "MW";
          existing.access = "admin";
          existing.accessRole = "admin";
          existing.adminOnly = true;
        } else {
          const adminIndex = state.nav.findIndex(n => String(n.label || "").includes("관리자"));
          const insertAt = adminIndex >= 0 ? adminIndex : state.nav.length;
          state.nav.splice(insertAt, 0, { icon: "▣", label: "MW", access: "admin", accessRole: "admin", adminOnly: true });
        }
      }

      const epcBaseNormalize = normalizeState;
      normalizeState = function() {
        epcBaseNormalize();
        epcEnsureNav();
      };

      const epcBaseViewForLabel = viewForLabel;
      viewForLabel = function(label) {
        const text = String(label || "").replace(/\\s+/g, ""); return (text.includes("EPC손익") || text.includes("MW")) ? "epc" : epcBaseViewForLabel(label);
      };

      const epcBaseIsActive = isActive;
      isActive = function(label) {
        const text = String(label || "").replace(/\\s+/g, ""); return currentView === "epc" ? (text.includes("EPC손익") || text.includes("MW")) : epcBaseIsActive(label);
      };

      function epcWon(value) {
        value = Number(value) || 0;
        const abs = Math.abs(value);
        if (abs >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
        if (abs >= 10000) return `${Math.round(value / 10000).toLocaleString()}만`;
        return Math.round(value).toLocaleString();
      }

      function epcMw(value) {
        value = Number(value) || 0;
        if (!value) return "-";
        return value >= 1000 ? `${(value / 1000).toFixed(1)}MW` : `${value.toFixed(1)}kW`;
      }

      function epcStatusClass(status) {
        status = String(status || "");
        if (status.includes("완료")) return "green";
        if (status.includes("대기") || status.includes("보류")) return "amber";
        if (status.includes("공사") || status.includes("진행")) return "blue";
        if (status.includes("취소")) return "red";
        return "";
      }

      function epcRiskScore(project) {
        return (project.risk || []).length * 100000000 + (project.unpaid || 0) + Math.max(-(project.profit || 0), 0);
      }

      function epcFiltered() {
        const q = epcState.query.trim().toLowerCase();
        let rows = epcData.projects.filter(p => {
          const hay = `${p.plant} ${p.region} ${p.manager} ${p.corp} ${p.type}`.toLowerCase();
          if (q && !hay.includes(q)) return false;
          if (epcState.status && p.status !== epcState.status) return false;
          if (epcState.risk && !(p.risk || []).includes(epcState.risk)) return false;
          return true;
        });
        const sorters = {
          risk: (a, b) => epcRiskScore(b) - epcRiskScore(a),
          unpaid: (a, b) => (b.unpaid || 0) - (a.unpaid || 0),
          profit: (a, b) => (a.profit || 0) - (b.profit || 0),
          capacity: (a, b) => (b.capacity || 0) - (a.capacity || 0),
        };
        return rows.sort(sorters[epcState.sort] || sorters.risk);
      }

      function epcKpis(rows) {
        const sum = key => rows.reduce((s, p) => s + (Number(p[key]) || 0), 0);
        const cards = [
          ["프로젝트", rows.length.toLocaleString(), "현재 필터 기준"],
          ["허가/공사 용량", epcMw(sum("capacity")), "입력된 용량 기준"],
          ["매출 추정", epcWon(sum("revenue")) + "원", "공급가 또는 수금 합산"],
          ["미수 추정", epcWon(sum("unpaid")) + "원", "수금 차액 포함"],
          ["선택 원가", epcWon(sum("cost")) + "원", "자재·시공·수수료"],
          ["위험 알림", rows.filter(p => (p.risk || []).length).length.toLocaleString(), "미수·저마진·대기"],
        ];
        return `<section class="epc-kpis">${cards.map(([a,b,c]) => `<div class="kpi"><div class="label">${a}</div><div class="value">${b}</div><div class="delta">${c}</div></div>`).join("")}</section>`;
      }

      function epcDetail(project) {
        if (!project) return `<div class="meta">발전소를 선택하세요.</div>`;
        const margin = project.margin == null ? "-" : `${(project.margin * 100).toFixed(1)}%`;
        const stages = ["발전허가","개발행위","PPA","구조물","공사계획","사용전검사","상업운전","설비등록"];
        return `
          <div class="epc-detail-head">
            <div><h2>${esc(project.plant)}</h2><div class="meta">${esc(project.region)} · ${esc(project.manager)}</div></div>
            <span class="badge ${epcStatusClass(project.status)}">${esc(project.status)}</span>
          </div>
          <div class="epc-metrics">
            <div><span>매출 추정</span><strong>${epcWon(project.revenue)}원</strong></div>
            <div><span>수금액</span><strong>${epcWon(project.payments)}원</strong></div>
            <div><span>미수금</span><strong>${epcWon(project.unpaid)}원</strong></div>
            <div><span>마진율</span><strong>${margin}</strong></div>
            <div><span>원가</span><strong>${epcWon(project.cost)}원</strong></div>
            <div><span>손익</span><strong class="${project.profit < 0 ? "epc-red" : "epc-green"}">${epcWon(project.profit)}원</strong></div>
          </div>
          <div class="epc-chips">${(project.risk || []).map(r => `<span class="badge red">${esc(r)}</span>`).join("") || `<span class="badge green">위험 없음</span>`}</div>
          <div class="epc-stage-list">
            ${stages.map(stage => {
              const done = !(project.missingStages || []).includes(stage);
              return `<div><span class="epc-dot ${done ? "done" : ""}"></span>${esc(stage)}</div>`;
            }).join("")}
          </div>`;
      }

      function renderEpcView() {
        const activeSearch = document.activeElement?.id === "epcSearch" ? document.activeElement : null;
        const activeSearchValue = activeSearch ? activeSearch.value : null;
        const activeSearchStart = activeSearch ? activeSearch.selectionStart : null;
        const activeSearchEnd = activeSearch ? activeSearch.selectionEnd : null;
        const usingSharedDb = epcApplySharedDb();
        let view = $("#epcView");
        if (!view) {
          const main = document.querySelector("main");
          main.insertAdjacentHTML("beforeend", `<section class="panel hidden" id="epcView"></section>`);
          view = $("#epcView");
        }
        view.classList.toggle("hidden", currentView !== "epc");
        const statuses = Object.entries(epcData.statusCounts || {}).sort((a,b) => b[1] - a[1]);
        const rows = epcFiltered();
        if (!epcState.selectedId || !rows.some(p => p.id === epcState.selectedId)) {
          epcState.selectedId = rows.find(p => (p.risk || []).length)?.id || rows[0]?.id || null;
        }
        const selected = rows.find(p => p.id === epcState.selectedId);
        const bodyRows = rows.slice(0, 180).map(p => {
          const progress = Math.round((p.completedStages / p.totalStages) * 100);
          const risk = (p.risk || []).length ? p.risk.map(r => `<span class="badge red">${esc(r)}</span>`).join("") : `<span class="meta">정상</span>`;
          return `<tr data-epc-id="${p.id}" class="${p.id === epcState.selectedId ? "epc-selected" : ""}">
            <td><strong>${esc(p.plant)}</strong><div class="meta">${esc(p.region)} · ${esc(p.corp)} · ${esc(p.type)}</div></td>
            <td><span class="badge ${epcStatusClass(p.status)}">${esc(p.status)}</span></td>
            <td>${epcMw(p.capacity)}</td>
            <td>${epcWon(p.revenue)}원</td>
            <td class="${p.unpaid > 0 ? "epc-red" : ""}">${epcWon(p.unpaid)}원</td>
            <td class="${p.profit < 0 ? "epc-red" : "epc-green"}">${epcWon(p.profit)}원</td>
            <td><div class="bar"><span style="width:${progress}%"></span></div><div class="meta">${p.completedStages}/${p.totalStages}</div></td>
            <td><div class="epc-chips">${risk}</div></td>
          </tr>`;
        }).join("");
        view.innerHTML = `
          <div class="epc-source-note"><strong>${usingSharedDb ? "공유 DB 기준" : "내장 샘플 DB 기준"}</strong><span>${usingSharedDb ? "DB 메뉴에서 업로드한 최신 엑셀을 EPC 손익에 반영 중입니다." : "아직 공유 DB가 없어 최초 분석 데이터로 표시 중입니다. DB 메뉴에서 최신 엑셀을 업로드하세요."}</span></div>
          <div class="epc-toolbar">
            <input class="search" id="epcSearch" placeholder="발전소명, 지역, 담당자 검색" value="${esc(epcState.query)}">
            <select id="epcStatus"><option value="">전체 상태</option>${statuses.map(([s,c]) => `<option value="${esc(s)}" ${epcState.status === s ? "selected" : ""}>${esc(s)} (${c})</option>`).join("")}</select>
            <select id="epcRisk">
              ${["","완료 후 미수","원가 선투입","저마진","장기대기","공정누락"].map(r => `<option value="${esc(r)}" ${epcState.risk === r ? "selected" : ""}>${r || "전체 위험"}</option>`).join("")}
            </select>
            <select id="epcSort">
              ${[["risk","위험순"],["unpaid","미수금순"],["profit","손익순"],["capacity","용량순"]].map(([v,l]) => `<option value="${v}" ${epcState.sort === v ? "selected" : ""}>${l}</option>`).join("")}
            </select>
          </div>
          ${epcKpis(rows)}
          <section class="epc-grid">
            <div class="panel epc-table-panel">
              <div class="panel-title"><h2>발전소 손익·공정 목록</h2><span class="meta">상위 180건 표시</span></div>
              <div class="table-wrap"><table><thead><tr><th>발전소</th><th>상태</th><th>용량</th><th>매출</th><th>미수</th><th>손익</th><th>공정</th><th>알림</th></tr></thead><tbody>${bodyRows || `<tr><td colspan="8">조건에 맞는 발전소가 없습니다.</td></tr>`}</tbody></table></div>
            </div>
            <aside class="panel epc-detail-panel"><div class="panel-title"><h2>발전소 상세</h2></div>${epcDetail(selected)}</aside>
          </section>`;
        if (activeSearch) {
          const nextSearch = $("#epcSearch");
          if (nextSearch) {
            nextSearch.value = activeSearchValue ?? epcState.query;
            nextSearch.focus();
            try {
              const pos = Math.min(nextSearch.value.length, activeSearchEnd ?? nextSearch.value.length);
              nextSearch.setSelectionRange(Math.min(nextSearch.value.length, activeSearchStart ?? pos), pos);
            } catch {}
          }
        }
      }

      const epcBaseRenderView = renderView;
      renderView = function() {
        const isEpc = currentView === "epc";
        epcBaseRenderView();
        $("#epcView")?.classList.toggle("hidden", !isEpc);
        if (isEpc) {
          $("#kpis")?.classList.add("hidden");
          els.dashboardView?.classList.add("hidden");
          els.adminView?.classList.add("hidden");
          els.mainGrid?.classList.add("hidden");
          if (els.driveView) els.driveView.classList.add("hidden");
          if (els.reportView) els.reportView.classList.add("hidden");
          if (els.dbView) els.dbView.classList.add("hidden");
          if (els.fieldworkView) els.fieldworkView.classList.add("hidden");
          if (els.meetingView) els.meetingView.classList.add("hidden");
          $("#sharedNotice")?.classList.add("hidden");
          renderEpcView();
        }
      };

      const epcBaseRenderCurrent = renderCurrentContent;
      renderCurrentContent = function() {
        if (currentView === "epc") {
          syncViewChrome();
          renderEpcView();
          return;
        }
        epcBaseRenderCurrent();
      };

      const epcBaseSync = syncViewChrome;
      syncViewChrome = function() {
        epcBaseSync();
        if (currentView === "epc") {
          els.pageTitle.textContent = "MW";
          els.pageSub.textContent = "전체 발전소 DB에서 미수, 원가, 손익, 공정 위험을 한 번에 확인합니다.";
          const action = $("#addProjectBtn");
          if (action) {
            action.textContent = "DB 보기";
            action.style.display = "";
          }
        }
      };

      document.addEventListener("compositionstart", e => {
        if (e.target?.id === "epcSearch") epcState.composing = true;
      });

      document.addEventListener("compositionend", e => {
        if (e.target?.id === "epcSearch") {
          epcState.composing = false;
          const input = e.target;
          clearTimeout(epcSearchTimer);
          epcSearchTimer = setTimeout(() => {
            epcState.query = input.value;
            renderEpcView();
          }, 360);
        }
      });

      document.addEventListener("input", e => {
        if (e.target?.id === "epcSearch") {
          epcState.query = e.target.value;
          if (epcState.composing || e.isComposing) return;
          clearTimeout(epcSearchTimer);
          epcSearchTimer = setTimeout(renderEpcView, 420);
        }
      });

      document.addEventListener("change", e => {
        if (e.target?.id === "epcStatus") { epcState.status = e.target.value; renderEpcView(); }
        if (e.target?.id === "epcRisk") { epcState.risk = e.target.value; renderEpcView(); }
        if (e.target?.id === "epcSort") { epcState.sort = e.target.value; renderEpcView(); }
      });

      document.addEventListener("click", e => {
        const row = e.target.closest("[data-epc-id]");
        if (row) {
          epcState.selectedId = Number(row.dataset.epcId);
          renderEpcView();
          return;
        }
        const t = e.target.closest("button") || e.target;
        if (currentView === "epc" && t.id === "addProjectBtn") {
          e.preventDefault();
          e.stopImmediatePropagation();
          goToView("db", "DB");
        }
        if (currentView === "epc" && t.id === "epcRefreshBtn") {
          e.preventDefault();
          e.stopImmediatePropagation();
          epcApplySharedDb();
          renderEpcView();
          toast("공유 DB 기준으로 EPC 손익을 새로 계산했습니다.");
        }
      }, true);

      if (!document.getElementById("epcDashboardStyle")) document.head.insertAdjacentHTML("beforeend", `<style id="epcDashboardStyle">
        #epcView{padding:16px}
        .epc-source-note{display:flex;justify-content:space-between;gap:10px;align-items:center;border:1px solid var(--line);background:#f7fbff;border-radius:8px;padding:10px 12px;margin-bottom:10px;color:var(--muted);font-size:13px}
        .epc-source-note strong{color:var(--teal)}
        .epc-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
        .epc-toolbar .search{max-width:340px}
        .epc-kpis{display:grid;grid-template-columns:repeat(6,minmax(130px,1fr));gap:12px;margin-bottom:14px}
        .epc-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:14px;align-items:start}
        .epc-table-panel{padding:16px;height:calc(100vh - 260px);display:flex;flex-direction:column}
        .epc-table-panel .table-wrap{flex:1;min-height:0}
        .epc-detail-panel{padding:16px}
        .epc-detail-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px}
        .epc-detail-head h2{margin:0;font-size:20px}
        .epc-metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}
        .epc-metrics>div{border:1px solid var(--line);border-radius:8px;padding:10px;background:#fff}
        .epc-metrics span{display:block;color:var(--muted);font-size:12px;margin-bottom:6px}
        .epc-red{color:var(--red)!important;font-weight:900}
        .epc-green{color:var(--green)!important;font-weight:900}
        .epc-chips{display:flex;gap:4px;flex-wrap:wrap}
        .epc-stage-list{display:grid;gap:8px;margin-top:14px;color:var(--muted);font-size:13px}
        .epc-dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#d8e1e5;margin-right:8px}
        .epc-dot.done{background:var(--green)}
        tr.epc-selected{background:#eef8fa}
        @media(max-width:1180px){.epc-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.epc-grid{grid-template-columns:1fr}.epc-table-panel{height:auto}}
        @media(max-width:620px){.epc-kpis{grid-template-columns:1fr}#epcView{padding:12px}}
      </style>`);

      if (localStorage.getItem(viewStorageKey) === "epc") currentView = "epc";
      epcEnsureNav();
      setTimeout(() => {
        try {
          epcEnsureNav();
          normalizePermissionState?.();
          renderNav?.();
          if (currentView === "epc") {
            syncViewChrome?.();
            renderView?.();
            renderCurrentContent?.();
          }
        } catch (err) {
          console.error("MW view refresh failed", err);
        }
      }, 0);
    })();


    (function setupMessageReplyCenter(){
      const messageCategories=[
        {type:"안전·긴급",badge:"red",keys:["긴급","위험","화재","누전","감전","정전","사고","파손","연기","탄냄새","침수","태풍","낙뢰"],reply:"안전과 직결될 수 있는 내용이라 우선 확인하겠습니다. 설비 주변 접근은 잠시 피하시고, 차단기·인버터 화면·현장 상태 사진을 보내주시면 1차로 위험 여부를 확인하겠습니다. 현장 상황과 담당 일정 확인 후 조치 순서를 안내드리겠습니다."},
        {type:"누수 A/S",badge:"amber",keys:["누수","물이새","물 새","빗물","방수","지붕","물떨어","물 떨어","샘","새는"],reply:"누수 관련 내용은 현장 상태를 먼저 확인해야 정확한 조치 방향을 잡을 수 있습니다. 누수 위치, 물이 떨어지는 지점, 지붕 또는 구조물 주변 사진을 보내주시면 담당자가 1차 확인 후 보수 범위와 가능한 일정을 조율해 안내드리겠습니다."},
        {type:"인버터 A/S",badge:"amber",keys:["인버터","에러","오류","알람","발전량","발전 안","안나와","안 나와","정지","접속반","차단기","전압","통신"],reply:"인버터 관련 증상은 화면 알람과 발전량 상태를 먼저 확인하겠습니다. 인버터 화면, 에러코드, 차단기 상태, 발생 시간을 사진으로 보내주시면 원격으로 확인 가능한 부분부터 검토하고 방문 필요 여부와 가능한 일정을 안내드리겠습니다."},
        {type:"축사 보강",badge:"blue",keys:["축사","보강","추가보강","추가 보강","처짐","흔들","보강재","브라켓","지붕보강","구조보강"],reply:"축사 추가 보강 관련 내용 확인했습니다. 기존 구조 상태와 보강 위치를 먼저 확인해야 범위와 자재를 정할 수 있습니다. 보강이 필요한 위치 사진, 전체 지붕 사진, 요청하시는 보강 범위를 보내주시면 담당자가 검토 후 작업 가능 방향과 일정을 안내드리겠습니다."},
        {type:"기타 A/S",badge:"amber",keys:["하자","as","a/s","고장","불량","소음","파손","문제","이상","봐줘","확인요청","확인 요청"],reply:"말씀 주신 내용은 A/S 확인 건으로 접수하겠습니다. 증상과 위치가 보이도록 사진 또는 짧은 영상을 보내주시면 담당자가 1차 확인 후 조치 방향, 방문 필요 여부, 가능한 일정을 안내드리겠습니다."},
        {type:"일정 문의",badge:"blue",keys:["언제","일정","방문","착공","준공","공사","시공","완료","도착","몇시","몇 시","늦","지연"],reply:"일정 문의 확인했습니다. 현재 현장 진행상황, 담당자 일정, 자재 및 날씨 여건을 함께 확인한 뒤 가능한 일정으로 안내드리겠습니다. 일정은 현장 상황에 따라 조정될 수 있어 확인 후 다시 회신드리겠습니다."},
        {type:"서류/인허가",badge:"green",keys:["서류","계약서","도면","인허가","허가","한전","PPA","접수","신청","준공서류","사업자","사용전검사"],reply:"요청하신 서류 및 인허가 관련 내용 확인하겠습니다. 필요한 서류명, 제출처, 희망 기한을 알려주시면 현재 준비 상태와 누락 여부를 확인해 처리 방향을 안내드리겠습니다."},
        {type:"비용/정산",badge:"amber",keys:["견적","금액","비용","입금","정산","세금계산서","계산서","원가","수금","미수","잔금","추가비"],reply:"비용 및 정산 관련 문의 확인했습니다. 계약 기준, 추가 발생 항목, 입금/세금계산서 상태를 확인한 뒤 안내드리겠습니다. 금액 관련 내용은 확인 후 정확하게 말씀드리겠습니다."},
        {type:"불만 민원",badge:"red",keys:["불만","항의","민원","짜증","화남","책임","약속","연락없","연락 안","왜","너무","계속"],reply:"불편을 드려 죄송합니다. 말씀 주신 내용은 내부 담당자에게 전달해 우선 확인하겠습니다. 발생 내용과 원하시는 조치 방향을 같이 정리해 주시면, 현장 상황과 처리 가능 일정을 확인한 뒤 안내드리겠습니다."}
      ];
      function ensureMessageNav(){
        state.nav=Array.isArray(state.nav)?state.nav:[];
        if(!state.nav.some(n=>String(n.label||"").replace(/\s/g,"")==="메세지")){
          const reportIndex=state.nav.findIndex(n=>String(n.label||"").includes("보고서"));
          const adminIndex=state.nav.findIndex(n=>String(n.label||"").includes("관리자"));
          const insertAt=reportIndex>=0?reportIndex:(adminIndex>=0?adminIndex:state.nav.length);
          state.nav.splice(insertAt,0,{icon:"✉",label:"메세지",access:"member"});
        }
        state.messages=Array.isArray(state.messages)?state.messages:[];
      }
      function injectMessageChrome(){
        if(!$("#messageView")){
          els.adminView.insertAdjacentHTML("afterend",`<section class="panel hidden" id="messageView"></section>`);
          els.messageView=$("#messageView");
        }
        if(!$("#messageStyle")){
          document.head.insertAdjacentHTML("beforeend",`<style id="messageStyle">
            #messageView{box-shadow:none;background:transparent;border:0;padding:0}
            .message-shell{display:grid;grid-template-columns:420px minmax(0,1fr);gap:14px;align-items:start}
            .message-card{background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:16px;min-width:0}
            .message-form{display:grid;gap:10px}.message-form textarea{min-height:180px}
            .message-result{display:grid;gap:12px}.message-output{border:1px solid #cfe3d8;background:#f7fffb;border-radius:8px;padding:14px;white-space:pre-wrap;line-height:1.7;font-size:14px}
            .message-meta-grid{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:8px}
            .message-meta-grid>div{border:1px solid var(--line);border-radius:8px;padding:10px;background:#fbfdfe}
            .message-history{display:grid;gap:8px;margin-top:12px}.message-row{display:grid;grid-template-columns:120px 1fr 90px 90px auto;gap:8px;align-items:center;border:1px solid var(--line);border-radius:8px;background:#fff;padding:10px}
            .message-row strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.message-row p{margin:3px 0 0;color:var(--muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
            @media(max-width:1100px){.message-shell{grid-template-columns:1fr}.message-meta-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.message-row{grid-template-columns:1fr auto}}
            @media(max-width:620px){.message-meta-grid{grid-template-columns:1fr}}
          </style>`);
        }
      }
      function normalizeMessageText(v){return String(v||"").toLowerCase().replace(/\s+/g," ")}
      function analyzeMessage(text){
        const raw=String(text||"").trim();
        const compact=normalizeMessageText(raw);
        const scores=messageCategories.map(c=>({cat:c,score:c.keys.reduce((s,k)=>s+(compact.includes(String(k).toLowerCase())?1:0),0)})).sort((a,b)=>b.score-a.score);
        const best=scores[0]?.score?scores[0].cat:{type:"일반 문의",badge:"blue",reply:"문의 내용 확인했습니다. 담당자가 내용을 검토한 뒤 필요한 확인사항과 처리 방향을 정리해 안내드리겠습니다."};
        const urgent=messageCategories[0].keys.some(k=>compact.includes(String(k).toLowerCase()))||/오늘|즉시|빨리|급|당장/.test(raw);
        const needPhoto=/하자|고장|불량|누수|에러|오류|파손|인버터|접속반|차단기|발전량|현장|사진|축사|보강|처짐|흔들/.test(raw);
        const needSchedule=/일정|언제|방문|공사|시공|착공|준공|완료|도착|지연/.test(raw);
        const actions=[];
        if(urgent)actions.push("담당자 즉시 확인");
        if(needPhoto)actions.push(/축사|보강|처짐|흔들/.test(raw)?"보강 위치·전체 사진 요청":"현장/증상 사진 요청");
        if(needSchedule)actions.push("방문·처리 일정 확인");
        if(/비용|견적|입금|정산|계산서|미수|잔금/.test(raw))actions.push("금액·계약 기준 확인");
        if(/서류|허가|한전|PPA|접수|사용전검사/.test(raw))actions.push("서류 진행상태 확인");
        if(!actions.length)actions.push("담당자 내용 검토");
        return {type:best.type,badge:best.badge,urgency:urgent?"긴급":"보통",reply:best.reply,actions:[...new Set(actions)]};
      }
      function buildMessageReply(){
        const sender=$("#messageSender")?.value.trim()||"고객";
        const site=$("#messageSite")?.value.trim();
        const incoming=$("#messageIncoming")?.value.trim();
        const tone=$("#messageTone")?.value||"기본";
        const a=analyzeMessage(incoming);
        const hello=tone==="간단"?"안녕하세요.":`안녕하세요, ${sender}님.`;
        const lines=[hello];
        if(site)lines.push(`현장: ${site}`);
        lines.push("");
        lines.push(`[${a.type} 접수 안내]`);
        lines.push(a.reply);
        lines.push("");
        lines.push("확인 요청 사항");
        a.actions.forEach((x,i)=>lines.push(`${i+1}. ${x}`));
        lines.push("");
        lines.push("안내");
        if(tone==="강한사과"){
          lines.push("불편을 드린 점 다시 한번 죄송합니다.");
          lines.push("내부 확인 후 처리 방향을 최대한 빠르게 안내드리겠습니다.");
        }else{
          lines.push("확인 후 가능한 처리 방향을 안내드리겠습니다.");
        }
        return lines.join("\n");
      }
      function currentMessageAnalysis(){
        return analyzeMessage($("#messageIncoming")?.value||"");
      }
      function renderMessageView(){
        injectMessageChrome();
        const reply=buildMessageReply();
        const a=currentMessageAnalysis();
        const rows=(state.messages||[]).slice(0,30).map((m,i)=>`<div class="message-row"><div><span class="badge ${esc(m.badge||"blue")}">${esc(m.type||"일반 문의")}</span></div><div><strong>${esc(m.sender||"고객")} ${m.site?`· ${esc(m.site)}`:""}</strong><p>${esc(m.incoming||"")}</p></div><span class="badge ${m.status==="완료"?"green":"amber"}">${esc(m.status||"대기")}</span><span class="meta">${esc(m.date||"")}</span><div class="row-actions"><button class="btn icon" data-copy-message="${i}">복사</button><button class="btn icon" data-done-message="${i}">완료</button><button class="btn icon danger" data-delete-message="${i}">삭제</button></div></div>`).join("");
        els.messageView.innerHTML=`<div class="message-shell"><section class="message-card message-form"><div class="panel-title"><h2>메세지 자동응답</h2><button class="btn primary" id="saveMessageBtn" type="button">접수 저장</button></div><input class="field" id="messageSender" placeholder="고객명 또는 업체명" value="${esc($("#messageSender")?.value||"")}"><input class="field" id="messageSite" placeholder="현장/발전소명" value="${esc($("#messageSite")?.value||"")}"><select class="field" id="messageTone"><option value="기본" ${$("#messageTone")?.value==="기본"?"selected":""}>기본 응대</option><option value="간단" ${$("#messageTone")?.value==="간단"?"selected":""}>간단 답변</option><option value="강한사과" ${$("#messageTone")?.value==="강한사과"?"selected":""}>불만/사과 강조</option></select><textarea class="field" id="messageIncoming" placeholder="고객 민원, 카톡, 문자 내용을 붙여넣으세요.">${esc($("#messageIncoming")?.value||"")}</textarea><div class="toolbar"><button class="btn" id="clearMessageBtn" type="button">비우기</button><button class="btn primary" id="copyMessageReplyBtn" type="button">답변 복사</button></div></section><section class="message-card message-result"><div class="panel-title"><h2>자동 인식 결과</h2><span class="badge ${esc(a.badge)}" id="messageTypeBadge">${esc(a.type)}</span></div><div class="message-meta-grid"><div><div class="label">긴급도</div><div class="value" style="font-size:22px" id="messageUrgencyValue">${esc(a.urgency)}</div></div><div><div class="label">필요 조치</div><strong id="messageActionValue">${esc(a.actions[0]||"확인")}</strong></div><div><div class="label">응대 방식</div><strong id="messageToneValue">${esc($("#messageTone")?.value||"기본")}</strong></div><div><div class="label">저장 건수</div><div class="value" style="font-size:22px">${state.messages.length}</div></div></div><div class="label">답변 초안</div><div class="message-output" id="messageReplyOutput">${esc(reply)}</div><div class="message-card" style="box-shadow:none"><div class="panel-title"><h2>접수 이력</h2><span class="meta">최근 30건</span></div><div class="message-history">${rows||`<div class="meta">저장된 메세지가 없습니다.</div>`}</div></div></section></div>`;
      }
      function updateMessagePreview(){
        const a=currentMessageAnalysis();
        const badge=$("#messageTypeBadge");
        if(badge){badge.className="badge "+a.badge;badge.textContent=a.type}
        const urgency=$("#messageUrgencyValue");if(urgency)urgency.textContent=a.urgency;
        const action=$("#messageActionValue");if(action)action.textContent=a.actions[0]||"확인";
        const tone=$("#messageToneValue");if(tone)tone.textContent=$("#messageTone")?.value||"기본";
        const output=$("#messageReplyOutput");if(output)output.textContent=buildMessageReply();
      }
      function saveMessageFromForm(){
        const incoming=$("#messageIncoming")?.value.trim();
        if(!incoming){toast("먼저 메세지 내용을 입력해 주세요.");return}
        const a=analyzeMessage(incoming);
        state.messages=Array.isArray(state.messages)?state.messages:[];
        state.messages.unshift({id:uid("message"),date:today,time:new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"}),sender:$("#messageSender")?.value.trim()||"고객",site:$("#messageSite")?.value.trim(),incoming,reply:buildMessageReply(),type:a.type,badge:a.badge,urgency:a.urgency,actions:a.actions,status:"대기",owner:loginName?.()||""});
        saveState("메세지 접수와 답변 초안을 저장했습니다.");
        renderMessageView();
      }
      async function copyText(text){try{await navigator.clipboard.writeText(text);toast("복사했습니다.")}catch{const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("복사했습니다.")}}
      const baseNormalizeForMessages=normalizeState;
      normalizeState=function(){baseNormalizeForMessages();ensureMessageNav()};
      const baseViewForLabelForMessages=viewForLabel;
      viewForLabel=function(label){return String(label||"").replace(/\s/g,"").includes("메세지")?"messages":baseViewForLabelForMessages(label)};
      const baseIsActiveForMessages=isActive;
      isActive=function(label){return currentView==="messages"?String(label||"").replace(/\s/g,"").includes("메세지"):baseIsActiveForMessages(label)};
      const baseRenderViewForMessages=renderView;
      renderView=function(){injectMessageChrome();baseRenderViewForMessages();const isMessages=currentView==="messages";els.messageView.classList.toggle("hidden",!isMessages);$("#kpis")?.classList.toggle("hidden",isMessages||currentView==="dashboard"||currentView==="assignments"||currentView==="todos"||currentView==="epc");els.dashboardView?.classList.toggle("hidden",currentView!=="dashboard");els.adminView?.classList.toggle("hidden",currentView!=="admin");els.mainGrid?.classList.toggle("hidden",isMessages||currentView==="dashboard"||currentView==="admin"||currentView==="epc");document.body.classList.toggle("message-page",isMessages)};
      const baseRenderCurrentForMessages=renderCurrentContent;
      renderCurrentContent=function(){if(currentView==="messages"){syncViewChrome();renderMessageView();return}baseRenderCurrentForMessages()};
      const baseSyncForMessages=syncViewChrome;
      syncViewChrome=function(){baseSyncForMessages();if(currentView==="messages"){els.pageTitle.textContent="메세지";els.pageSub.textContent="민원, 문의, 요청 내용을 자동 분류하고 답변 초안을 만듭니다.";const top=$("#addProjectBtn");if(top){top.textContent="접수 저장";top.disabled=false;top.classList.add("primary")}}};
      document.addEventListener("input",e=>{if(currentView==="messages"&&["messageSender","messageSite","messageIncoming"].includes(e.target?.id))updateMessagePreview()},true);
      document.addEventListener("change",e=>{if(currentView==="messages"&&e.target?.id==="messageTone")updateMessagePreview()},true);
      document.addEventListener("click",e=>{
        const t=e.target.closest("button")||e.target;
        if(currentView==="messages"&&t.id==="addProjectBtn"){e.preventDefault();e.stopImmediatePropagation();saveMessageFromForm();return}
        if(t.id==="saveMessageBtn"){e.preventDefault();e.stopImmediatePropagation();saveMessageFromForm();return}
        if(t.id==="copyMessageReplyBtn"){e.preventDefault();e.stopImmediatePropagation();copyText($("#messageReplyOutput")?.textContent||buildMessageReply());return}
        if(t.id==="clearMessageBtn"){e.preventDefault();e.stopImmediatePropagation();["messageSender","messageSite","messageIncoming"].forEach(id=>{const el=$("#"+id);if(el)el.value=""});renderMessageView();return}
        if(t.dataset.copyMessage!==undefined){const m=state.messages[Number(t.dataset.copyMessage)];if(m)copyText(m.reply||"");return}
        if(t.dataset.doneMessage!==undefined){const m=state.messages[Number(t.dataset.doneMessage)];if(m){m.status="완료";saveState("메세지를 완료 처리했습니다.");renderMessageView()}return}
        if(t.dataset.deleteMessage!==undefined){const i=Number(t.dataset.deleteMessage);if(confirm("이 메세지 이력을 삭제할까요?")){state.messages.splice(i,1);saveState("메세지를 삭제했습니다.");renderMessageView()}return}
      },true);
      ensureMessageNav();
    })();


    /* 최종 카테고리 화면/저장 안정화 레이어 */
    ;(() => {
      const categoryRegistry={
        dashboard:{kind:"native",showKpis:true,showDashboard:true,body:["dashboard-page"]},
        admin:{kind:"native",showAdmin:true,body:["admin-page"]},
        projects:{kind:"main",showMain:true,showTable:true,body:["projects-page"]},
        construction:{kind:"main",showMain:true,showTable:true,showKpis:true,showConstructionSide:true,body:["construction-page"]},
        assignments:{kind:"main",showMain:true,body:["schedule-page"]},
        todos:{kind:"main",showMain:true,body:["todo-page"]},
        drive:{kind:"custom",elementId:"driveView",body:["drive-page"]},
        reports:{kind:"custom",elementId:"reportView",body:["report-page"]},
        db:{kind:"custom",elementId:"dbView",body:["db-page"]},
        fieldwork:{kind:"custom",elementId:"fieldworkView",body:["fieldwork-page"]},
        meetings:{kind:"custom",elementId:"meetingView",body:["view-meetings"]},
        epc:{kind:"custom",elementId:"epcView",body:["epc-page"]},
        messages:{kind:"custom",elementId:"messageView",body:["message-page"]}
      };
      const categoryBodyClasses=[...new Set(Object.values(categoryRegistry).flatMap(x=>x.body||[]))];
      function categoryConfig(view=currentView){return categoryRegistry[view]||categoryRegistry.projects}
      function categoryCustomViews(){
        return Object.entries(categoryRegistry).filter(([,cfg])=>cfg.elementId).map(([view,cfg])=>({view,el:document.getElementById(cfg.elementId)})).filter(x=>x.el);
      }
      function finalApplyCategoryShell(){
        const cfg=categoryConfig(),isCustom=cfg.kind==="custom";
        $("#kpis")?.classList.toggle("hidden",!cfg.showKpis);
        els.dashboardView?.classList.toggle("hidden",!cfg.showDashboard);
        els.adminView?.classList.toggle("hidden",!cfg.showAdmin);
        els.mainGrid?.classList.toggle("hidden",!cfg.showMain);
        categoryCustomViews().forEach(({view,el})=>el.classList.toggle("hidden",currentView!==view));
        $("#sharedNotice")?.classList.toggle("hidden",isCustom);
        categoryBodyClasses.forEach(cls=>document.body.classList.toggle(cls,(cfg.body||[]).includes(cls)));
        if(cfg.showMain){
          els.mainGrid?.classList.toggle("schedule-mode",currentView==="assignments");
          els.mainGrid?.classList.toggle("todo-mode",currentView==="todos");
          els.mainGrid?.classList.toggle("construction-mode",currentView==="construction");
        }
        if(cfg.showTable){
          els.tableFilters?.classList.remove("hidden");
          els.tableWrap?.classList.remove("hidden");
          els.assignmentCalendarPanel?.classList.add("hidden");
          $("#todoBoardPanel")?.classList.add("hidden");
        }
        const showConstruction=!!cfg.showConstructionSide;
        els.currentPlantsPanel?.classList.toggle("hidden",!showConstruction);
        els.upcomingPlantsPanel?.classList.toggle("hidden",!showConstruction);
        els.constructionReportPanel?.classList.toggle("hidden",!showConstruction);
      }
      window.kiwoomCategoryRegistry=categoryRegistry;
      const baseFinalRenderView=renderView;
      renderView=function(){baseFinalRenderView();finalApplyCategoryShell()};
      const baseFinalRender=render;
      render=function(){baseFinalRender();finalApplyCategoryShell()};
      const baseFinalGoToView=goToView;
      goToView=function(view,label=""){baseFinalGoToView(view,label);finalApplyCategoryShell()};

      function readConstructionFormFinal(){
        const status=$("#constructionStatus")?.value||"예정";
        return {
          id:editingConstructionIndex!==null?state.construction?.[editingConstructionIndex]?.id||uid("construction"):uid("construction"),
          company:$("#constructionCompany")?.value||state.constructionTeams?.[0]||"",
          structureTeam:$("#constructionStructureTeam")?.value||state.structureTeams?.[0]||"",
          site:$("#constructionSite")?.value.trim()||"이름 없는 발전소",
          kw:Number($("#constructionKw")?.value)||0,
          sales:$("#constructionSales")?.value||"",
          customer:$("#constructionCustomer")?.value||"",
          phase:$("#constructionPhase")?.value||state.constructionPhases?.[0]||"",
          owner:$("#constructionOwner")?.value||"",
          start:$("#constructionStart")?.value||today,
          end:$("#constructionEnd")?.value||"",
          status,
          next:withConstructionStatusLine($("#constructionNext")?.value||"",status)
        };
      }
      const saveConstructionBtn=$("#saveConstructionBtn");
      if(saveConstructionBtn){
        saveConstructionBtn.onclick=e=>{
          e?.preventDefault?.();
          e?.stopImmediatePropagation?.();
          state.construction=Array.isArray(state.construction)?state.construction:[];
          const item=readConstructionFormFinal();
          if(editingConstructionIndex!==null&&state.construction[editingConstructionIndex])state.construction[editingConstructionIndex]=item;
          else state.construction.unshift(item);
          currentView="construction";
          localStorage.setItem(viewStorageKey,currentView);
          $("#constructionModal")?.classList.remove("open");
          render();
          saveStateAfterPaint("시공일정을 저장했습니다.");
          setTimeout(()=>{renderView();renderCurrentContent();finalApplyCategoryShell()},30);
        };
      }
      const deleteConstructionBtn=$("#deleteConstructionInModalBtn");
      if(deleteConstructionBtn){
        deleteConstructionBtn.onclick=e=>{
          e?.preventDefault?.();
          e?.stopImmediatePropagation?.();
          if(editingConstructionIndex===null||!confirm("이 시공일정을 삭제할까요?"))return;
          state.construction.splice(editingConstructionIndex,1);
          editingConstructionIndex=null;
          currentView="construction";
          localStorage.setItem(viewStorageKey,currentView);
          $("#constructionModal")?.classList.remove("open");
          render();
          saveStateAfterPaint("시공일정을 삭제했습니다.");
        };
      }
      const baseFinalSetSyncNotice=setSyncNotice;
      setSyncNotice=function(kind,msg){
        baseFinalSetSyncNotice(kind,msg);
        const n=$("#sharedNotice");
        if(n){
          const hint=kind==="saving"?"자동 저장 중":kind==="ok"?"자동 저장 완료":"저장 확인 필요";
          n.querySelector("strong")&&(n.querySelector("strong").textContent=hint);
        }
      };
      const float=$("#sheetSyncFloatBtn");
      if(float)float.title="자동 저장이 기본입니다. 급할 때만 누르세요.";
      window.kiwoomDebugState=()=>({view:currentView,build:appBuildVersion,todos:state.todos?.length||0,assignments:state.assignments?.length||0,construction:state.construction?.length||0,meetings:state.meetings?.length||0,pending:!!state.__pendingCloudSync});
      setTimeout(finalApplyCategoryShell,0);
    })();


    /* 회의록 삭제 버튼 최종 보강: 리스트 X/상세 삭제를 클릭보다 먼저 처리 */
    ;(() => {
      function removeMeetingFinal(id, ask=true){
        if(!id)return false;
        state.meetings=Array.isArray(state.meetings)?state.meetings:[];
        const target=state.meetings.find(m=>String(m.id)===String(id));
        if(!target)return false;
        if(ask&&!confirm(`'${target.title||"회의록"}' 회의록을 삭제할까요?`))return false;
        if(typeof disableMeetingSamples==="function")disableMeetingSamples();
        if(typeof markDeleted==="function")markDeleted("meetings",id);
        state.meetings=state.meetings.filter(m=>String(m.id)!==String(id));
        selectedMeetingId=state.meetings[0]?.id||"";
        $("#meetingModal")?.classList.remove("open");
        if(currentView!=="meetings"){currentView="meetings";localStorage.setItem(viewStorageKey,currentView)}
        render?.();
        renderNav?.();
        updateTopButtons?.();
        saveStateAfterPaint("회의록을 삭제했습니다.");
        return true;
      }
      document.addEventListener("pointerdown",e=>{
        const btn=e.target.closest?.("[data-delete-meeting]");
        if(!btn||currentView!=="meetings")return;
        e.preventDefault();
        e.stopImmediatePropagation();
        removeMeetingFinal(btn.dataset.deleteMeeting,true);
      },true);
      document.addEventListener("click",e=>{
        const btn=e.target.closest?.("[data-delete-meeting]");
        if(!btn||currentView!=="meetings")return;
        e.preventDefault();
        e.stopImmediatePropagation();
      },true);
      window.kiwoomDeleteMeetingForTest=removeMeetingFinal;
    })();


    /* 카테고리별 자체 점검: 운영 저장소를 건드리지 않는 화면/동작 검증 */
    ;(() => {
      function visible(el){return !!el&&!el.classList.contains("hidden")&&getComputedStyle(el).display!=="none"}
      function expect(name,ok,details=""){return {name,ok:!!ok,details}}
      async function runCategorySelfTest(){
        const original={view:currentView,state:clone(state),selectedMeetingId:typeof selectedMeetingId!=="undefined"?selectedMeetingId:""};
        const originalFns={saveState,saveStateAfterPaint,scheduleSharedSave,pushSharedState,saveToSupabase};
        const results=[];
        const wait=ms=>new Promise(r=>setTimeout(r,ms));
        const checkView=(view,selector,label,extra=()=>true)=>{
          currentView=view;localStorage.setItem(viewStorageKey,view);render();
          const el=$(selector);
          results.push(expect(`${label}: 전용 화면 표시`,visible(el),selector));
          results.push(expect(`${label}: 화면 겹침 방지`,view==="dashboard"||view==="admin"||visible(el)||!visible(els.mainGrid),`view=${view}`));
          const more=extra();
          if(more!==true)results.push(more);
        };
        try{
          saveState=()=>{};
          saveStateAfterPaint=()=>{};
          scheduleSharedSave=()=>{};
          pushSharedState=async()=>true;
          saveToSupabase=async()=>true;
          state.people=state.people?.length?state.people:[{name:"이재강",role:"과장",pin:"0217",accessRole:"admin"}];
          state.todos=[{id:"selftest-todo",title:"자체점검 할일",owner:state.people[0].name,status:"할 일",priority:"보통",due:today,detail:"자동 점검"}];
          state.assignments=[{id:"selftest-assignment",title:"자체점검 일정",owner:state.people[0].name,project:"일반업무",type:"회의",status:"지시",priority:"보통",start:today,due:today}];
          state.construction=[];
          state.meetings=[{id:"selftest-meeting",date:today,time:"09:00",title:"자체점검 회의록",host:state.people[0].name,attendees:[state.people[0].name],project:"일반업무",type:"회의",summary:"자동 점검",decisions:[]}];
          state.messages=[{id:"selftest-message",date:today,time:"09:00",sender:"고객",incoming:"누수 확인 요청",reply:"확인하겠습니다.",type:"누수 A/S",badge:"amber",urgency:"보통",actions:["현장 확인"],status:"대기",owner:state.people[0].name}];
          state.fieldworkLogs=[{id:"selftest-fw",person:state.people[0].name,status:"현장도착",site:"자체점검 현장",region:"경남",memo:"자동 점검",date:today,time:new Date().toISOString()}];
          state.businessDb=state.businessDb||{rows:[]};

          currentView="meetings";render();await wait(40);
          results.push(expect("회의록: 전용 화면 표시",visible($("#meetingView"))&&!visible(els.mainGrid),`view=${currentView}`));
          results.push(expect("회의록: 시공 KPI 미표시",!document.body.innerText.includes("시공 진행률")&&!document.body.innerText.includes("상태별 발전소")));
          window.kiwoomDeleteMeetingForTest?.("selftest-meeting",false);await wait(40);
          results.push(expect("회의록: 삭제 동작",!(state.meetings||[]).some(m=>m.id==="selftest-meeting")));

          currentView="construction";render();openConstructionModal();$("#constructionSite").value="자체점검 발전소";$("#constructionKw").value="50";$("#constructionStatus").value="시공중";$("#saveConstructionBtn").click();await wait(80);
          results.push(expect("시공일정: 저장 후 목록 표시",(state.construction||[]).some(c=>c.site==="자체점검 발전소")&&document.body.innerText.includes("자체점검 발전소")));

          currentView="todos";render();await wait(30);
          results.push(expect("할일관리: 보드 표시",visible($("#todoBoardPanel"))&&document.body.innerText.includes("자체점검 할일")));
          results.push(expect("할일관리: KPI 숨김",$("#kpis")?.classList.contains("hidden")));

          currentView="messages";render();await wait(30);
          results.push(expect("메세지: 자동응답 화면 표시",visible($("#messageView"))&&document.body.innerText.includes("메세지 자동응답")));

          currentView="reports";render();await wait(30);
          results.push(expect("보고서: 보고서 화면 표시",visible($("#reportView"))&&document.body.innerText.includes("시공월별보고서")));

          currentView="db";render();await wait(30);
          results.push(expect("DB: DB 화면 표시",visible($("#dbView"))&&document.body.innerText.includes("DB")));

          currentView="fieldwork";render();await wait(30);
          results.push(expect("외근현황: 화면 표시",visible($("#fieldworkView"))&&document.body.innerText.includes("외근")));

          currentView="epc";render();await wait(30);
          results.push(expect("MW: 손익 화면 표시",visible($("#epcView"))&&document.body.innerText.includes("발전소 손익")));
        }catch(err){
          results.push(expect("자체점검 실행 오류",false,err?.message||String(err)));
        }finally{
          saveState=originalFns.saveState;
          saveStateAfterPaint=originalFns.saveStateAfterPaint;
          scheduleSharedSave=originalFns.scheduleSharedSave;
          pushSharedState=originalFns.pushSharedState;
          saveToSupabase=originalFns.saveToSupabase;
          clearTimeout(syncSaveTimer);
          state=original.state;
          currentView=original.view;
          if(typeof selectedMeetingId!=="undefined")selectedMeetingId=original.selectedMeetingId;
          localStorage.setItem(viewStorageKey,currentView);
          render();
        }
        const ok=results.every(r=>r.ok);
        console.table?.(results);
        return {ok,build:appBuildVersion,results};
      }
      window.kiwoomRunCategorySelfTest=runCategorySelfTest;
    })();


    /* 운영 안정화: 동기화 상태와 모바일 사용성 */
    ;(() => {
      function ensureSyncPill(){
        let pill=$("#syncStatusPill");
        if(!pill){
          const toolbar=document.querySelector("header .toolbar");
          toolbar?.insertAdjacentHTML("afterbegin",`<span id="syncStatusPill" class="sync-status-pill" data-sync="ok">자동저장 대기</span>`);
          pill=$("#syncStatusPill");
        }
        return pill;
      }
      function updateSyncPill(kind="ok",msg="자동저장 대기"){
        const pill=ensureSyncPill();
        if(!pill)return;
        pill.dataset.sync=kind;
        pill.textContent=kind==="saving"?"저장 중":kind==="warn"?"저장 확인":msg;
        pill.title=msg;
      }
      const prevSetSyncNoticeForPill=setSyncNotice;
      setSyncNotice=function(kind,msg){prevSetSyncNoticeForPill(kind,msg);updateSyncPill(kind,msg)};
      const prevPushSharedStateForPill=pushSharedState;
      pushSharedState=async function(...args){updateSyncPill("saving","자동 저장 중입니다.");const ok=await prevPushSharedStateForPill(...args);updateSyncPill(ok?"ok":"warn",ok?"저장 완료":"저장 확인 필요");return ok};
      ensureSyncPill();
      if(!$("#hardeningResponsiveStyle"))document.head.insertAdjacentHTML("beforeend",`<style id="hardeningResponsiveStyle">
        /* ── 동기화 상태 pill (헤더 안) ── */
        .sync-status-pill{
          display:inline-flex;align-items:center;min-height:28px;
          border:1px solid #b7e2cf;background:#f7fffb;color:#177245;
          border-radius:999px;padding:0 10px;font-size:11px;font-weight:900;
          white-space:nowrap;flex-shrink:0;cursor:default
        }
        .sync-status-pill[data-sync="saving"]{border-color:#bee3f8;background:#f7fbff;color:#075f6c}
        .sync-status-pill[data-sync="warn"]{border-color:#ffd2a8;background:#fffaf2;color:#a15c00}

        /* ══ 헤더 레이아웃 완전 재설계 ══ */
        header{overflow:visible!important;align-items:flex-start!important}
        header .header-actions{
          display:flex!important;
          flex-direction:column!important;
          align-items:flex-end!important;
          gap:6px!important;
          flex-shrink:0;
        }
        header .toolbar{
          display:flex!important;
          align-items:center!important;
          gap:6px!important;
          flex-wrap:wrap!important;
          justify-content:flex-end!important;
          max-width:100%;
        }
        header .toolbar .btn{flex-shrink:0;font-size:12px!important;min-height:32px!important;padding:0 10px!important}
        header .login-info{
          font-size:11px!important;
          min-height:24px!important;
          padding:3px 8px!important;
          white-space:nowrap;
          max-width:260px;
          overflow:hidden;text-overflow:ellipsis;
        }

        /* 모바일: 하단에 주입되는 mobileOptimStyle이 최종 처리 */
        @media(max-width:768px){
          .meeting-shell,.message-shell,.db-shell,.report-shell,.monthly-report-shell,.fieldwork-live-layout,.epc-grid{grid-template-columns:1fr!important}
          .meeting-list,.meeting-detail,.epc-table-panel{max-height:none!important;height:auto!important}
        }
      </style>`);
      window.kiwoomModuleStatus=()=>Object.fromEntries(Object.entries(window.kiwoomCategoryRegistry||{}).map(([k,v])=>[k,{kind:v.kind,elementId:v.elementId||"",active:currentView===k}]));
    })();

    /* ════════════════════════════════════════════════════════════
       🌅 모닝 브리핑 (관리자 전용)
       - 매일 07:00 이후 첫 접속 시 팝업
       - 팀원별 오늘 할일 + 연체 항목 정리
       - "오늘 그만보기" 지원
       - 바로 카톡 업무지시 전송 가능
    ════════════════════════════════════════════════════════════ */
    ;(()=>{
      document.head.insertAdjacentHTML("beforeend",`<style id="morningBriefingStyle">
        #morningBriefingOverlay{position:fixed;inset:0;background:rgba(10,20,28,.45);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px}
        #morningBriefingModal{background:#fff;border-radius:20px;width:min(780px,100%);max-height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(10,20,28,.28);overflow:hidden}
        .mb-head{background:linear-gradient(135deg,#07877e,#0b6470);color:#fff;padding:20px 24px;flex-shrink:0}
        .mb-head h2{margin:0 0 4px;font-size:20px}
        .mb-head p{margin:0;opacity:.82;font-size:13px}
        .mb-body{overflow-y:auto;flex:1;padding:16px}
        .mb-person{border:1px solid #e3ebe5;border-radius:14px;margin-bottom:12px;overflow:hidden}
        .mb-person-head{background:#f4faf8;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
        .mb-person-name{font-weight:900;font-size:15px;display:flex;align-items:center;gap:8px}
        .mb-count{border-radius:999px;padding:2px 8px;font-size:12px;font-weight:900}
        .mb-count.overdue{background:#fde8e4;color:#b91c1c}
        .mb-count.today{background:#fff1dc;color:#8a4b00}
        .mb-count.normal{background:#e6f3eb;color:#2f8f52}
        .mb-todo-list{padding:10px 16px;display:grid;gap:6px}
        .mb-todo-item{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:start;padding:8px 10px;border-radius:8px;background:#fafcfd;border:1px solid #edf2ee}
        .mb-todo-item.overdue{background:#fff5f5;border-color:#f0b2a9}
        .mb-todo-item.today{background:#fffbf0;border-color:#f5d08b}
        .mb-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
        .mb-dot.overdue{background:#ef4444}
        .mb-dot.today{background:#f59e0b}
        .mb-dot.normal{background:#10b981}
        .mb-todo-title{font-size:13px;font-weight:850;line-height:1.4}
        .mb-todo-meta{font-size:11px;color:#71806f;margin-top:2px}
        .mb-kakao-btn{border:1px solid #f5d08b;background:#fff8d6;color:#8a4b00;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:900;white-space:nowrap;cursor:pointer;flex-shrink:0}
        .mb-kakao-btn:hover{background:#fef0a0}
        .mb-foot{padding:14px 20px;border-top:1px solid #e3ebe5;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;flex-wrap:wrap}
        .mb-dismiss{border:1px solid #dde5e0;background:#f7faf8;color:#52636b;border-radius:999px;padding:0 16px;min-height:36px;cursor:pointer;font-weight:850;font-size:13px}
        .mb-dismiss:hover{background:#edf2ee}
        .mb-close{border:0;background:transparent;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;line-height:1;padding:0;flex-shrink:0}
        .mb-close:hover{color:#fff}
        .mb-empty{text-align:center;padding:24px;color:#71806f;font-size:14px}
        @media(max-width:600px){#morningBriefingModal{border-radius:14px;max-height:92vh}.mb-head{padding:14px 16px}.mb-head h2{font-size:17px}.mb-body{padding:10px}.mb-foot{padding:10px 14px}}
      </style>`);

      const BRIEFING_KEY=()=>`morning-briefing-dismissed-${localDateString()}`;

      function buildKakaoMsg(person,todos){
        const lines=[`안녕하세요 ${person.name} ${person.role||""}님 👋`,"","📋 오늘의 업무 브리핑입니다.",""];
        const overdue=todos.filter(t=>t.due&&t.due<today);
        const dueToday=todos.filter(t=>t.due===today);
        const others=todos.filter(t=>!t.due||t.due>today);
        if(overdue.length){lines.push("🔴 마감 지난 항목");overdue.forEach(t=>lines.push(`  • [${t.status}] ${t.title} (${t.due||"날짜미정"})`));lines.push("")}
        if(dueToday.length){lines.push("🟡 오늘 마감");dueToday.forEach(t=>lines.push(`  • [${t.status}] ${t.title}`));lines.push("")}
        if(others.length){lines.push("📌 진행중 항목");others.forEach(t=>lines.push(`  • [${t.status}] ${t.title}${t.due?` (~${t.due})`:""}`));lines.push("")}
        lines.push(`총 ${todos.length}건 | 화이팅! 💪`);
        return lines.join("\n");
      }

      function openKakaoForPerson(person,todos){
        const msg=buildKakaoMsg(person,todos);
        /* 기존 카카오 모달 재사용 */
        const box=$("#kakaoTodoText")||document.createElement("textarea");
        if($("#kakaoTodoModal")){
          if($("#kakaoTodoText"))$("#kakaoTodoText").value=msg;
          $("#kakaoTodoModal").classList.add("open");
          return;
        }
        /* 폴백: 클립보드 복사 */
        navigator.clipboard?.writeText(msg).then(()=>toast(`${person.name} 업무지시 복사됨! 카톡에 붙여넣기 하세요.`));
      }

      function renderMorningBriefing(){
        const activePeople=(state.people||[]).filter(p=>p.name);
        const briefings=activePeople.map(person=>{
          const todos=(state.todos||[]).filter(t=>{
            if(t.status==="완료"||t.status==="취소")return false;
            return t.owner===person.name||(Array.isArray(t.helpers)&&t.helpers.includes(person.name));
          });
          const overdue=todos.filter(t=>t.due&&t.due<today);
          const dueToday=todos.filter(t=>t.due===today);
          return{person,todos,overdue,dueToday};
        }).filter(b=>b.todos.length>0);

        const bodyHtml=briefings.length?briefings.map(({person,todos,overdue,dueToday})=>{
          const countBadges=[
            overdue.length?`<span class="mb-count overdue">🔴 연체 ${overdue.length}건</span>`:"",
            dueToday.length?`<span class="mb-count today">🟡 오늘 ${dueToday.length}건</span>`:"",
            (todos.length-overdue.length-dueToday.length)>0?`<span class="mb-count normal">✅ 진행중 ${todos.length-overdue.length-dueToday.length}건</span>`:""
          ].filter(Boolean).join(" ");
          const sortedTodos=[...overdue,...dueToday,...todos.filter(t=>!overdue.includes(t)&&!dueToday.includes(t))];
          const itemsHtml=sortedTodos.slice(0,8).map(t=>{
            const isOD=t.due&&t.due<today,isToday=t.due===today;
            const cls=isOD?"overdue":isToday?"today":"";
            const dotCls=isOD?"overdue":isToday?"today":"normal";
            return`<div class="mb-todo-item ${cls}"><span class="mb-dot ${dotCls}"></span><div><div class="mb-todo-title">${esc(t.title)}</div><div class="mb-todo-meta">${esc(t.status)} · ${t.due?`마감 ${esc(t.due)}`:"날짜 미정"} · ${esc(t.priority||"보통")}</div></div></div>`;
          }).join("")+(sortedTodos.length>8?`<div style="font-size:12px;color:#71806f;padding:4px 0">외 ${sortedTodos.length-8}건...</div>`:"");
          return`<div class="mb-person"><div class="mb-person-head"><div class="mb-person-name"><span style="width:32px;height:32px;border-radius:50%;background:#07877e;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;flex-shrink:0">${esc(person.name.slice(-1))}</span>${esc(person.name)} <span style="color:#71806f;font-size:13px;font-weight:700">${esc(person.role||"")}</span></div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">${countBadges}<button class="mb-kakao-btn" data-briefing-kakao="${esc(person.name)}">📱 카톡 업무지시</button></div></div><div class="mb-todo-list">${itemsHtml}</div></div>`;
        }).join(""):`<div class="mb-empty">🎉 오늘 진행중인 업무가 없습니다!</div>`;

        const html=`<div id="morningBriefingOverlay"><div id="morningBriefingModal"><div class="mb-head"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2>🌅 모닝 브리핑</h2><p>${localDateString()} · 관리자 업무 브리핑 · 총 ${briefings.reduce((s,b)=>s+b.todos.length,0)}건</p></div><button class="mb-close" id="mbCloseBtn">×</button></div></div><div class="mb-body">${bodyHtml}</div><div class="mb-foot"><button class="mb-dismiss" id="mbDismissBtn">오늘 그만보기</button><span style="font-size:12px;color:#71806f">팀원 카톡 버튼을 눌러 업무지시를 보내세요</span></div></div></div>`;
        document.body.insertAdjacentHTML("beforeend",html);

        /* 이벤트 */
        document.getElementById("mbCloseBtn")?.addEventListener("click",()=>document.getElementById("morningBriefingOverlay")?.remove());
        document.getElementById("mbDismissBtn")?.addEventListener("click",()=>{localStorage.setItem(BRIEFING_KEY(),"1");document.getElementById("morningBriefingOverlay")?.remove();toast("오늘 하루 모닝 브리핑을 닫았습니다.")});
        document.getElementById("morningBriefingOverlay")?.addEventListener("click",e=>{if(e.target.id==="morningBriefingOverlay")document.getElementById("morningBriefingOverlay")?.remove()});
        document.querySelectorAll("[data-briefing-kakao]").forEach(btn=>{
          btn.addEventListener("click",()=>{
            const name=btn.dataset.briefingKakao;
            const person=(state.people||[]).find(p=>p.name===name);
            const todos=(state.todos||[]).filter(t=>(t.owner===name||(t.helpers||[]).includes(name))&&t.status!=="완료"&&t.status!=="취소");
            if(person&&todos.length)openKakaoForPerson(person,todos);
            else toast("해당 팀원의 진행중 할일이 없습니다.");
          });
        });
      }

      function checkMorningBriefing(){
        if(!authReady)return;
        if(!adminUnlocked&&!isCurrentAdminUser?.())return; /* 관리자만 */
        if(localStorage.getItem(BRIEFING_KEY())==="1")return; /* 오늘 이미 닫음 */
        const h=new Date().getHours();
        if(h<7)return; /* 07시 이전은 표시 안 함 */
        if(document.getElementById("morningBriefingOverlay"))return; /* 이미 열려있음 */
        renderMorningBriefing();
      }

      /* showApp 이후 3초 후 체크 (데이터 로드 완료 후) */
      const origShowApp=showApp;
      showApp=function(){origShowApp.apply(this,arguments);setTimeout(checkMorningBriefing,3000)};

      /* 수동으로 열 수 있는 전역 함수 */
      window.openMorningBriefing=()=>{document.getElementById("morningBriefingOverlay")?.remove();renderMorningBriefing()};
    })();

    /* ════════════════════════════════════════════════════════════
       📱 모바일/스마트폰 UI 완전 재설계
       - 최고 우선순위로 주입 (모든 기존 CSS 오버라이드)
       - 하단 탭 네비게이션
       - 할일 보드 자동 목록 전환
    ════════════════════════════════════════════════════════════ */
    ;(()=>{
      const isMobile=()=>window.innerWidth<=768;

      /* ── 모바일 전용 스타일 (최고 우선순위) ── */
      const mobileCSS=`
        /* 목표: 크롬/엣지/웨일/스마트폰에서 안정적인 레이아웃 */
        @media(max-width:768px){
          body{overflow-x:hidden}
          /* 사이드바: 상단 고정 수평 스크롤 탭 (하단 탭바 대신 - 더 안정적) */
          body .app{display:block!important;grid-template-columns:none!important}
          body aside{
            position:sticky!important;top:0!important;z-index:100!important;
            width:100%!important;min-height:0!important;
            border-right:0!important;border-bottom:1px solid var(--line)!important;
            padding:6px 8px!important;
            background:rgba(238,244,245,.97)!important;
            display:block!important;
          }
          body aside .brand{display:none!important}
          body aside nav{
            display:flex!important;flex-direction:row!important;
            overflow-x:auto!important;scrollbar-width:none!important;
            gap:4px!important;padding:0!important;flex-wrap:nowrap!important;
          }
          body aside nav::-webkit-scrollbar{display:none!important}
          body aside .nav-btn{
            flex:0 0 auto!important;white-space:nowrap!important;
            min-height:36px!important;padding:0 10px!important;
            font-size:12px!important;border-radius:8px!important;
            display:flex!important;align-items:center!important;gap:6px!important;
          }
          /* 메인 */
          body main{padding:10px 10px 20px!important}
          /* 헤더 */
          body header{padding:10px 12px!important;margin-bottom:10px!important;border-radius:12px!important;overflow:visible!important}
          body header h1{font-size:18px!important;margin:0!important}
          body header .sub{font-size:11px!important}
          body header .header-actions{display:flex!important;flex-direction:column!important;align-items:flex-end!important;gap:4px!important}
          body header .toolbar{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;gap:4px!important;scrollbar-width:none!important}
          body header .toolbar::-webkit-scrollbar{display:none!important}
          body header .toolbar .btn{flex-shrink:0!important;font-size:11px!important;min-height:32px!important;padding:0 8px!important;white-space:nowrap!important}
          body header .login-info{font-size:10px!important;min-height:auto!important;padding:2px 8px!important;max-width:220px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
          body header .sync-status-pill{font-size:10px!important;min-height:26px!important;padding:0 8px!important}
          /* KPI */
          .kpis{grid-template-columns:repeat(2,1fr)!important;gap:6px!important}
          .kpi{padding:10px!important}
          .kpi .value{font-size:20px!important}
          /* 그리드 */
          .grid,#mainGrid{grid-template-columns:1fr!important;height:auto!important;overflow:visible!important}
          #mainGrid>.panel{height:auto!important;display:block!important}
          #mainGrid>.panel .table-wrap{max-height:55vh;overflow:auto!important}
          #mainGrid>.stack{height:auto!important;overflow:visible!important}
          .panel{padding:12px!important;border-radius:12px!important}
          .panel-title{flex-wrap:wrap!important;gap:6px!important}
          /* 할일보드 */
          .todo-board{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;overflow:visible!important}
          .todo-column{min-width:0!important;border-radius:10px!important}
          .todo-card{border-radius:10px!important}
          /* 모달 */
          .overlay{align-items:flex-end!important;padding:0!important}
          .modal{width:100%!important;max-width:100%!important;border-radius:16px 16px 0 0!important;max-height:90vh!important}
          .form-grid{grid-template-columns:1fr!important;gap:8px!important}
          .form-row.full{grid-column:auto!important}
          /* 입력 */
          input,select,textarea,.field{font-size:16px!important}
          /* 테이블 */
          .table-wrap{overflow-x:auto!important}
          table{min-width:600px!important;font-size:12px!important}
          /* 기타 */
          .admin-grid{grid-template-columns:1fr!important}
          #mainGrid.construction-mode{grid-template-columns:1fr!important;height:auto!important;overflow:visible!important}
          #sheetSyncFloatBtn{bottom:20px!important;right:10px!important}
          .filters{flex-wrap:wrap!important}
          .search{min-width:0!important;width:100%!important}
        }
        @media(max-width:380px){
          body aside .nav-btn{font-size:11px!important;padding:0 8px!important}
          body main{padding:8px!important}
        }
      `;

      /* 최고 우선순위로 주입 (기존 모든 스타일 뒤) */
      function injectMobileStyle(){
        const existing=document.getElementById("mobileOptimStyle");
        if(existing)existing.remove();
        const el=document.createElement("style");
        el.id="mobileOptimStyle";
        el.textContent=mobileCSS;
        document.head.appendChild(el); /* appendChild = 마지막에 추가 → 최고 우선순위 */
      }
      injectMobileStyle();

      /* ── 모바일에서 할일 목록 뷰 자동 전환 ── */
      if(isMobile()){
        const origGoToView=goToView;
        goToView=function(view,...args){
          origGoToView.call(this,view,...args);
          if(view==="todos"&&isMobile()&&todoViewMode==="board"){
            /* 모바일: 보드 대신 목록 뷰는 화면 너비상 불필요, 그냥 1컬럼 보드 사용 */
          }
        };
      }

      /* 화면 크기 변경 시 재주입 */
      window.addEventListener("resize",injectMobileStyle,{passive:true});
    })();

    /* ══════════════════════════════════════════════════════
       구조물 외주 시공 검수 관리  (setupStructureInspectionView)
       엑셀 5시트 기반: 검수현황·체크리스트·하자관리·입금승인·가이드
    ══════════════════════════════════════════════════════ */
    (function setupStructureInspectionView(){
      const CHECKLIST_TMPL=[
        {cat:"기존 지붕 사전확인",item:"지붕재 상태",detail:"기존 지붕재(샌드위치판넬/칼라강판) 파손·부식·변형 여부 확인\n→ 구조물 하중 지지 가능 여부 판단"},
        {cat:"기존 지붕 사전확인",item:"지붕 하부구조",detail:"기존 트러스/C형강/퍼린 간격·규격 확인\n구조물 브라켓 고정점이 하부구조(퍼린) 위에 위치하는지 확인"},
        {cat:"기존 지붕 사전확인",item:"지붕 경사도",detail:"설계 경사도와 실측 경사도 일치 여부 (±1° 이내)\n경사 방향(앞/뒤물매) 확인"},
        {cat:"기존 지붕 사전확인",item:"누수 이력 확인",detail:"기존 누수 흔적 확인, 관통 시공 부위 사전 협의 기록 확인"},
        {cat:"알루미늄 레일 설치",item:"레일 규격 확인",detail:"가로레일/세로레일 단면 규격(폭×높이×두께) 설계도면 일치 확인\n자재 성적서 보유 여부"},
        {cat:"알루미늄 레일 설치",item:"레일 직선도",detail:"레일 직선도 확인 — 3m당 편차 3mm 이내\n레벨기 또는 실(줄) 대어 육안 확인"},
        {cat:"알루미늄 레일 설치",item:"레일 간격",detail:"레일 간격(모듈 사이즈 기준) 설계도면 일치 (±5mm)\n가로레일: 모듈 세로 길이 기준, 세로레일: 모듈 가로 기준"},
        {cat:"알루미늄 레일 설치",item:"레일 이음부(스플라이스)",detail:"이음 연결부 볼트 체결 확인, 이음부 유격 없음\n이음부 위치가 브라켓 바로 위 또는 인접부에 있을 것"},
        {cat:"베이스·고정부",item:"관통 브라켓 체결",detail:"볼트 체결 토크값 확인\n와셔·스프링와셔·너트 누락 없음"},
        {cat:"베이스·고정부",item:"베이스-퍼린 정합",detail:"브라켓이 기존 하부구조(퍼린/C형강) 위에 정확히 위치하는지 확인\n지붕재만 관통하고 퍼린 미체결 구간 없을 것"},
        {cat:"베이스·고정부",item:"방수 처리 (관통부) ★",detail:"관통부위 방수실리콘 처리 확인\n실리콘 도포 균일성, 빈틈 없음 ★ 입금 보류 1순위"},
        {cat:"베이스·고정부",item:"베이스",detail:"베이스 규격·재질·두께 도면 일치\n체결 볼트 규격(M10/M12 등) 확인"},
        {cat:"베이스·고정부",item:"비관통 클램프",detail:"비관통 방식 적용 구간: 클램프 물림 깊이·간격 확인"},
        {cat:"베이스·고정부",item:"지붕재 변형 확인",detail:"볼트 체결 시 지붕재 과도한 눌림·변형·찢어짐 없음\n판넬 접합부(조인트) 부위 체결 회피 여부"},
        {cat:"구조물 전체 형상",item:"설계도면 일치",detail:"구조물 전체 배열이 설계 배치도와 일치하는지 확인\n열 수, 행 수, 방향(남향 등)"},
        {cat:"구조물 전체 형상",item:"수평·경사 정렬",detail:"레일 수평도 확인 — 전체 구간 레벨 편차 ±3mm 이내\n모듈 설치 경사각 설계값 일치 (±1°)"},
        {cat:"구조물 전체 형상",item:"구조물 견고성",detail:"구조물 흔들림 테스트 — 상부에서 수평 방향 힘 가했을 때\n과도한 흔들림·유격 없을 것"},
        {cat:"구조물 전체 형상",item:"처짐 확인",detail:"구조물 자중에 의한 처짐 육안 확인\n(모듈 미설치 상태 기준, 이상 처짐 없을 것)"},
        {cat:"구조물 전체 형상",item:"부재 간 간섭",detail:"구조물 부재가 기존 시설물(환풍기, 배관, 천창 등)과 간섭 없음"},
        {cat:"안전·마감·현장정리",item:"볼트 돌출 처리",detail:"돌출 볼트 보호캡 설치 또는 절단 후 면취 처리\n작업자 안전사고 방지"},
        {cat:"안전·마감·현장정리",item:"절단면 버 제거",detail:"레일·브라켓 절단면의 날카로운 버(burr) 전수 제거\n장갑 착용 상태에서 긁힘 테스트"},
        {cat:"안전·마감·현장정리",item:"잔재물 수거",detail:"절단 칩·나사·포장재·케이블타이 잔재 전량 수거\n지붕 위 청소 완료 확인"},
        {cat:"안전·마감·현장정리",item:"지붕재 손상 보수",detail:"시공 중 발생한 지붕재 스크래치·찍힘 터치업 페인트 보수\n보수 안 된 손상 부위 기록"},
        {cat:"안전·마감·현장정리",item:"안전표지판",detail:"고압위험·감전주의·추락주의 표지판 부착 여부\n(발전소 운영 시 필요, 구조물 단계에서 부착 가능한 것)"}
      ];

      function blankChecklist(){return CHECKLIST_TMPL.map((t,i)=>({no:i+1,cat:t.cat,item:t.item,detail:t.detail,verdict:"",defect:"",deadline:""}))}
      function blankInsp(){
        return{id:uid("insp"),plantName:"",location:"",roofType:"공장 지붕",capacity:0,contractor:"",contractAmount:0,
          inspectionDate:today,inspector:loginName?.()||"",fieldSupervisor:"",workTeam:"",completionNoticeDate:"",
          checklistItems:blankChecklist(),defects:[],result:"미검수",passItems:0,failItems:0,naItems:0,totalEval:0,passRate:0,
          defectCount:0,defectComplete:0,paymentApproval:"대기",paymentAmount:0,paymentDate:"",paymentNote:"",paymentReason:"",
          createdAt:new Date().toISOString(),savedAt:new Date().toISOString()};
      }

      function calcResult(insp){
        const items=insp.checklistItems||[];
        const pass=items.filter(x=>x.verdict==="적합").length;
        const fail=items.filter(x=>x.verdict==="부적합").length;
        const na=items.filter(x=>x.verdict==="해당없음").length;
        const total=pass+fail;
        const rate=total>0?Math.round(pass/total*100):0;
        insp.passItems=pass;insp.failItems=fail;insp.naItems=na;insp.totalEval=total;insp.passRate=rate;
        if(total===0)insp.result="미검수";
        else if(rate===100)insp.result="적합";
        else if(rate>=95)insp.result="조건부적합";
        else insp.result="부적합";
        insp.defectCount=(insp.defects||[]).length;
        insp.defectComplete=(insp.defects||[]).filter(x=>x.status==="완료").length;
        return insp;
      }

      function rCls(r){return r==="적합"?"green":r==="조건부적합"?"amber":r==="부적합"?"red":""}

      function ensureInspState(){
        if(!Array.isArray(state.structureInspections))state.structureInspections=[];
        state.structureInspections.forEach(x=>{
          if(!x.id)x.id=uid("insp");
          if(!x.checklistItems||x.checklistItems.length<24)x.checklistItems=blankChecklist();
          if(!x.defects)x.defects=[];
          calcResult(x);
        });
      }

      const baseNormInsp=normalizeState;
      normalizeState=function(){baseNormInsp();ensureInspState()};

      const baseVFLInsp=viewForLabel;
      viewForLabel=function(lbl){return String(lbl||"").replace(/\s/g,"").includes("구조물검수")?"structureInspect":baseVFLInsp(lbl)};

      const baseIsActInsp=isActive;
      isActive=function(lbl){return currentView==="structureInspect"?String(lbl||"").replace(/\s/g,"")==="구조물검수":baseIsActInsp(lbl)};

      function ensureInspChrome(){
        if(!document.getElementById("inspectionView")){
          const anchor=document.getElementById("meetingView")||document.getElementById("epcView")||els.fieldworkView||els.dbView||els.adminView;
          anchor.insertAdjacentHTML("afterend",`<section class="panel hidden" id="inspectionView"></section>`);
        }
        if(document.getElementById("inspStyle"))return;
        document.head.insertAdjacentHTML("beforeend",`<style id="inspStyle">
          #inspectionView{box-shadow:none;background:transparent;border:0;padding:0}
          .insp-shell{display:grid;gap:14px}
          .insp-kpis{display:grid;grid-template-columns:repeat(5,minmax(100px,1fr));gap:10px}
          .insp-kpi{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px;box-shadow:var(--shadow);text-align:center}
          .insp-kpi .label{font-size:12px;color:var(--muted);margin-bottom:6px}
          .insp-kpi .value{font-size:30px;font-weight:900;line-height:1}
          .insp-kpi .value.green{color:#177245}.insp-kpi .value.amber{color:#a15c00}.insp-kpi .value.red{color:#c93728}
          .insp-card{background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);overflow:hidden}
          .insp-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 16px;border-bottom:1px solid var(--line)}
          .insp-card-head h2{font-size:15px;margin:0}
          .insp-tbl{width:100%;border-collapse:collapse;font-size:13px}
          .insp-tbl th{background:#f8fbfc;font-weight:900;font-size:12px;color:var(--muted);padding:8px 10px;border-bottom:2px solid var(--line);text-align:left;white-space:nowrap}
          .insp-tbl td{padding:9px 10px;border-bottom:1px solid #f0f4f6;vertical-align:middle}
          .insp-tbl tr:last-child td{border-bottom:0}
          .insp-tbl tr:hover td{background:#f7fbfc}
          .insp-plant-btn{background:none;border:none;cursor:pointer;font-weight:900;color:var(--teal);font-size:13px;padding:0;text-align:left;text-decoration:underline;text-decoration-color:transparent}
          .insp-plant-btn:hover{text-decoration-color:var(--teal)}
          .insp-empty-row{text-align:center;padding:40px!important;color:var(--muted);font-size:14px}
          /* ── 검수 모달 ── */
          #inspModal{max-width:980px;width:97vw;max-height:92vh;display:flex;flex-direction:column;overflow:hidden}
          #inspModal .modal-head{flex-shrink:0}
          .insp-tabs{display:flex;border-bottom:2px solid var(--line);background:#f8fbfc;flex-shrink:0}
          .insp-tab{padding:11px 20px;font-size:13px;font-weight:900;border:none;background:none;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-2px;transition:color .12s}
          .insp-tab.active{color:var(--teal);border-bottom-color:var(--teal);background:#fff}
          .insp-pane{padding:16px;display:none;overflow:auto;flex:1}
          .insp-pane.active{display:block}
          /* ── 기본정보 그리드 ── */
          .insp-form-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}
          .insp-form-grid label{font-size:11px;color:var(--muted);font-weight:900;display:block;margin-bottom:3px}
          .insp-form-grid input,.insp-form-grid select{width:100%;min-height:34px;padding:0 8px;border:1px solid var(--line);border-radius:6px;font-size:13px;box-sizing:border-box}
          .insp-form-grid .span2{grid-column:span 2}
          /* ── 결과 바 ── */
          .insp-result-bar{background:#f8fbfc;border:1px solid var(--line);border-radius:8px;padding:12px 16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:14px}
          .insp-rs{text-align:center;min-width:64px}
          .insp-rs .v{font-size:22px;font-weight:900;line-height:1.1}
          .insp-rs .l{font-size:11px;color:var(--muted);margin-top:3px}
          .insp-verdict-badge{font-size:15px;font-weight:900;padding:6px 16px;border-radius:8px;border:2px solid currentColor;margin-left:8px}
          .insp-verdict-badge.green{color:#177245;border-color:#177245;background:#f0fbf5}
          .insp-verdict-badge.amber{color:#a15c00;border-color:#f0d9a8;background:#fff8ea}
          .insp-verdict-badge.red{color:#c93728;border-color:#ffd2cc;background:#fff4f2}
          .insp-verdict-badge.grey{color:#71828b;border-color:#d9e0e4;background:#f6f8f9}
          .insp-result-hint{font-size:11px;color:var(--muted);margin-left:auto}
          /* ── 체크리스트 ── */
          .insp-section-hd{background:linear-gradient(90deg,#eaf8f6,#f8fbfd);padding:8px 12px;font-weight:900;font-size:12px;color:#07877e;border-radius:6px;margin:10px 0 4px;letter-spacing:.03em}
          .insp-row{display:grid;grid-template-columns:30px 180px minmax(0,1.4fr) 140px minmax(0,1fr);gap:8px;align-items:start;padding:8px;border-bottom:1px solid #f0f4f6;font-size:12px}
          .insp-row:last-child{border-bottom:0}
          .insp-no{color:var(--muted);font-weight:900;padding-top:5px;text-align:center}
          .insp-item-name{font-weight:900;line-height:1.4;padding-top:4px}
          .insp-item-detail{color:#71828b;font-size:11px;line-height:1.45;padding-top:4px;white-space:pre-line}
          .insp-btns{display:flex;gap:4px;flex-wrap:wrap;padding-top:2px}
          .insp-vbtn{padding:4px 8px;border:1px solid var(--line);border-radius:5px;background:#fff;cursor:pointer;font-size:11px;font-weight:900;line-height:1;transition:all .12s}
          .insp-vbtn.p.on{background:#177245;border-color:#177245;color:#fff}
          .insp-vbtn.f.on{background:#c93728;border-color:#c93728;color:#fff}
          .insp-vbtn.n.on{background:#71828b;border-color:#71828b;color:#fff}
          .insp-defect-in{width:100%;border:1px solid var(--line);border-radius:5px;padding:4px 7px;font-size:11px;min-height:30px;box-sizing:border-box}
          /* ── 하자관리 ── */
          .insp-add-form{background:#f8fbfc;border:1px solid var(--line);border-radius:8px;padding:12px;margin-bottom:12px}
          .insp-add-form strong{font-size:13px;display:block;margin-bottom:10px}
          .insp-add-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
          .insp-add-grid label{font-size:11px;color:var(--muted);font-weight:900;display:block;margin-bottom:3px}
          .insp-add-grid input,.insp-add-grid select{width:100%;min-height:30px;border:1px solid var(--line);border-radius:5px;padding:0 7px;font-size:12px;box-sizing:border-box}
          .insp-add-grid .sp2{grid-column:span 2}
          .insp-defect-summary{background:#fff8ea;border:1px solid #f0d9a8;border-radius:8px;padding:10px 14px;display:flex;gap:20px;margin-bottom:12px;font-size:13px;flex-wrap:wrap}
          .insp-dtbl{width:100%;border-collapse:collapse;font-size:12px}
          .insp-dtbl th{background:#f8fbfc;font-weight:900;font-size:11px;color:var(--muted);padding:7px 8px;border-bottom:2px solid var(--line);white-space:nowrap;text-align:left}
          .insp-dtbl td{padding:7px 8px;border-bottom:1px solid #f0f4f6;vertical-align:middle}
          .insp-dtbl tr:last-child td{border-bottom:0}
          .insp-status-sel{border:1px solid var(--line);border-radius:5px;padding:2px 5px;font-size:11px;background:#fff;cursor:pointer}
          /* ── 입금승인 ── */
          .insp-pay-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
          .insp-pay-sec{background:#f8fbfc;border:1px solid var(--line);border-radius:8px;padding:14px}
          .insp-pay-sec h3{font-size:13px;margin:0 0 12px;color:var(--teal);font-weight:900}
          .insp-pay-row{display:grid;grid-template-columns:130px 1fr;align-items:center;gap:8px;margin-bottom:8px;font-size:12px}
          .insp-pay-row label{color:var(--muted);font-weight:900}
          .insp-pay-row input,.insp-pay-row select{width:100%;border:1px solid var(--line);border-radius:5px;padding:4px 8px;font-size:12px;min-height:30px;box-sizing:border-box}
          .insp-sign-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;font-size:12px;text-align:center}
          .insp-sign-box{border:1px solid var(--line);border-radius:8px;padding:12px}
          .insp-sign-box .lbl{color:var(--muted);font-size:11px;margin-bottom:10px}
          .insp-sign-box .name{font-weight:900;font-size:14px}
          /* ── 인쇄 ── */
          /* 구조물 검수 화면 활성 시 다른 패널 강제 숨김 */
          body.view-structureInspect #mainGrid{display:none!important}
          body.view-structureInspect #kpis{display:none!important}
          body.view-structureInspect #dashboardView{display:none!important}
          body.view-structureInspect #adminView{display:none!important}
          body.view-structureInspect #fieldworkView{display:none!important}
          body.view-structureInspect #meetingView{display:none!important}
          body.view-structureInspect #messageView{display:none!important}
          body.view-structureInspect #reportView{display:none!important}
          body.view-structureInspect #dbView{display:none!important}
          body.view-structureInspect #epcView{display:none!important}
          body.view-structureInspect #sharedNotice{display:none!important}
          body.view-structureInspect #inspectionView{display:block!important}
          @media(max-width:960px){
            .insp-kpis{grid-template-columns:repeat(3,1fr)}
            .insp-pay-grid{grid-template-columns:1fr}
            .insp-form-grid{grid-template-columns:repeat(2,1fr)}
          }
          @media(max-width:680px){
            .insp-kpis{grid-template-columns:repeat(2,1fr)}
            .insp-form-grid{grid-template-columns:1fr}
            .insp-row{grid-template-columns:24px 1fr 120px;grid-template-rows:auto auto}
            .insp-item-detail{display:none}
            .insp-add-grid{grid-template-columns:repeat(2,1fr)}
          }
        </style>`);
      }

      /* ── 뷰 렌더링 ── */
      function renderInspView(){
        ensureInspChrome();ensureInspState();
        const el=document.getElementById("inspectionView");
        if(!el)return;
        const list=state.structureInspections||[];
        const total=list.length,pass=list.filter(x=>x.result==="적합").length,cond=list.filter(x=>x.result==="조건부적합").length,fail=list.filter(x=>x.result==="부적합").length,none=list.filter(x=>x.result==="미검수").length;
        const rows=list.map((ins,i)=>`<tr>
          <td>${i+1}</td>
          <td><button class="insp-plant-btn" data-open-insp="${i}" type="button">${esc(ins.plantName||"-")}</button></td>
          <td>${esc(ins.location||"-")}</td>
          <td>${esc(ins.roofType||"-")}</td>
          <td style="text-align:right">${ins.capacity?Number(ins.capacity).toLocaleString():"–"}</td>
          <td>${esc(ins.contractor||"-")}</td>
          <td>${esc(ins.inspectionDate||"-")}</td>
          <td><span class="badge ${rCls(ins.result)}">${esc(ins.result||"미검수")}</span></td>
          <td style="text-align:center">${ins.defectCount||0}</td>
          <td style="text-align:center">${ins.defectComplete||0}</td>
          <td><span class="badge ${ins.paymentApproval==="승인"?"green":ins.paymentApproval==="보류"?"red":""}">${esc(ins.paymentApproval||"대기")}</span></td>
          <td><button class="btn icon" data-edit-insp="${i}" type="button" title="수정">✎</button> <button class="btn icon danger" data-delete-insp="${i}" type="button" title="삭제">×</button></td>
        </tr>`).join("");
        el.innerHTML=`<div class="insp-shell">
          <div class="insp-kpis">
            <div class="insp-kpi"><div class="label">전체</div><div class="value">${total}</div></div>
            <div class="insp-kpi"><div class="label">적합</div><div class="value green">${pass}</div></div>
            <div class="insp-kpi"><div class="label">조건부적합</div><div class="value amber">${cond}</div></div>
            <div class="insp-kpi"><div class="label">부적합</div><div class="value red">${fail}</div></div>
            <div class="insp-kpi"><div class="label">미검수</div><div class="value">${none}</div></div>
          </div>
          <div class="insp-card">
            <div class="insp-card-head">
              <h2>🔍 구조물 외주 시공 검수 관리</h2>
              <div class="row-actions"><button class="btn primary" id="newInspBtn" type="button">+ 새 검수 등록</button></div>
            </div>
            <div style="overflow-x:auto">
              <table class="insp-tbl">
                <thead><tr>
                  <th>NO</th><th>발전소명</th><th>소재지</th><th>지붕유형</th><th>용량(kW)</th>
                  <th>외주업체</th><th>검수일자</th><th>결과</th><th>하자</th><th>보완완료</th><th>입금승인</th><th>관리</th>
                </tr></thead>
                <tbody>${rows||`<tr><td colspan="12" class="insp-empty-row">등록된 검수 내역이 없습니다.<br><span style="font-size:12px">+ 새 검수 등록 버튼을 눌러 추가하세요.</span></td></tr>`}</tbody>
              </table>
            </div>
          </div>
        </div>`;
      }

      /* ── 체크리스트 HTML ── */
      function buildChecklistHtml(insp){
        const cats=[...new Set(CHECKLIST_TMPL.map(t=>t.cat))];
        const items=insp.checklistItems||blankChecklist();
        return cats.map(cat=>{
          const catItems=items.filter(x=>x.cat===cat);
          return `<div class="insp-section-hd">${esc(cat)}</div>`+catItems.map(item=>`
            <div class="insp-row">
              <div class="insp-no">${item.no}</div>
              <div><div class="insp-item-name">${esc(item.item)}</div></div>
              <div class="insp-item-detail">${esc(item.detail||"")}</div>
              <div class="insp-btns">
                <button class="insp-vbtn p${item.verdict==="적합"?" on":""}" data-iv="${item.no}" data-val="적합" type="button">적합</button>
                <button class="insp-vbtn f${item.verdict==="부적합"?" on":""}" data-iv="${item.no}" data-val="부적합" type="button">부적합</button>
                <button class="insp-vbtn n${item.verdict==="해당없음"?" on":""}" data-iv="${item.no}" data-val="해당없음" type="button">해당없음</button>
                ${(()=>{const linked=(insp.defects||[]).find(d=>d.checklistNo===item.no);return item.verdict==="부적합"&&linked?.status!=="완료"?`<button class="insp-vbtn insp-action-btn" style="background:#e8faf0;color:#177245;border-color:#a8dfc0;font-size:10px" data-iv-complete="${item.no}" type="button">✅ 조치완료</button>`:"";})()}
              </div>
              <div><input class="insp-defect-in" data-id="${item.no}" placeholder="하자내용 기록" value="${esc(item.defect||"")}"></div>
            </div>`).join("");
        }).join("");
      }

      /* ── 결과 바 HTML ── */
      function buildResultBarHtml(insp){
        const tmp=calcResult(Object.assign({},insp,{checklistItems:insp.checklistItems?.map(x=>({...x}))||[],defects:insp.defects||[]}));
        const cls=rCls(tmp.result)||"grey";
        return `<div class="insp-result-bar" id="inspResultBar">
          <div class="insp-rs"><div class="v">${tmp.totalEval}</div><div class="l">평가항목</div></div>
          <div class="insp-rs"><div class="v" style="color:#177245">${tmp.passItems}</div><div class="l">적합</div></div>
          <div class="insp-rs"><div class="v" style="color:#c93728">${tmp.failItems}</div><div class="l">부적합</div></div>
          <div class="insp-rs"><div class="v">${tmp.naItems}</div><div class="l">해당없음</div></div>
          <div class="insp-rs"><div class="v">${tmp.passRate}%</div><div class="l">적합률</div></div>
          <span class="insp-verdict-badge ${cls}">${esc(tmp.result)}</span>
          <span class="insp-result-hint">100%→적합 | 95%이상→조건부 | 미만→부적합</span>
        </div>`;
      }

      /* ── 하자 탭 HTML ── */
      function buildDefectHtml(insp){
        const defs=insp.defects||[];
        const rows=defs.map((d,i)=>`<tr>
          <td>${i+1}</td>
          <td>${esc(d.category||"-")}</td>
          <td>${esc(d.defect||"-")}</td>
          <td><span class="badge ${d.severity==="상"?"red":d.severity==="중"?"amber":""}">${esc(d.severity||"경")}</span></td>
          <td>${esc(d.foundDate||"-")}</td>
          <td>${esc(d.deadlineDate||"-")}</td>
          <td>${esc(d.action||"-")}</td>
          <td>${esc(d.completionDate||"-")}</td>
          <td>${esc(d.confirmer||"-")}</td>
          <td><select class="insp-status-sel" data-defect-status="${i}">
            ${["미조치","진행중","완료"].map(s=>`<option${d.status===s?" selected":""}>${esc(s)}</option>`).join("")}
          </select></td>
          <td>${esc(d.note||"")}</td>
          <td style="white-space:nowrap">${d.status!=="완료"?`<button class="btn" style="background:#e8faf0;color:#177245;border-color:#a8dfc0;font-size:11px;padding:2px 7px" data-complete-defect="${i}" type="button">✅ 조치완료</button> `:"<span style='color:#177245;font-size:12px;font-weight:900'>✅ 완료</span> "}<button class="btn icon danger" data-del-defect="${i}" type="button">×</button></td>
        </tr>`).join("");
        const uninsp=defs.filter(x=>!x.status||x.status==="미조치").length;
        const inprog=defs.filter(x=>x.status==="진행중").length;
        const done=defs.filter(x=>x.status==="완료").length;
        return `<div class="insp-add-form">
          <strong>하자 수기 추가</strong>
          <div class="insp-add-grid">
            <div><label>검수구분</label><input id="dCat" placeholder="예: 레일설치"></div>
            <div class="sp2"><label>하자내용 *</label><input id="dContent" placeholder="하자 내용 입력"></div>
            <div><label>심각도</label><select id="dSev"><option>경</option><option>중</option><option>상</option></select></div>
            <div><label>발견일</label><input id="dFound" type="date" value="${today}"></div>
            <div><label>보완요구기한</label><input id="dDeadline" type="date"></div>
            <div class="sp2"><label>조치내용</label><input id="dAction" placeholder="조치 내용"></div>
            <div><label>조치완료일</label><input id="dDone" type="date"></div>
            <div><label>확인자</label><input id="dConfirmer"></div>
          </div>
          <div style="margin-top:10px;text-align:right"><button class="btn primary" id="addDefectBtn" type="button">+ 하자 추가</button></div>
        </div>
        <div class="insp-defect-summary">
          <span>전체 <strong>${defs.length}건</strong></span>
          <span style="color:#c93728">미조치 <strong>${uninsp}건</strong></span>
          <span style="color:#a15c00">진행중 <strong>${inprog}건</strong></span>
          <span style="color:#177245">완료 <strong>${done}건</strong></span>
          ${uninsp===0&&defs.length>0?`<span style="color:#177245;font-weight:900">✅ 입금 가능 (미조치 0건)</span>`:`<span style="color:#c93728">⚠ 미조치 ${uninsp}건 잔여</span>`}
          ${uninsp>0?`<button class="btn" style="background:#e8faf0;color:#177245;border-color:#a8dfc0;font-weight:900" data-complete-all-defects="" type="button">✅ 전체 조치완료</button>`:""}
        </div>
        <div style="overflow-x:auto">
          <table class="insp-dtbl">
            <thead><tr><th>#</th><th>검수구분</th><th>하자내용</th><th>심각도</th><th>발견일</th><th>보완기한</th><th>조치내용</th><th>조치완료일</th><th>확인자</th><th>상태</th><th>비고</th><th>삭제</th></tr></thead>
            <tbody>${rows||`<tr><td colspan="12" style="text-align:center;padding:20px;color:var(--muted)">등록된 하자가 없습니다.</td></tr>`}</tbody>
          </table>
        </div>`;
      }

      /* ── 입금승인 탭 HTML ── */
      function buildPaymentHtml(insp){
        const tmp=calcResult(Object.assign({},insp,{checklistItems:insp.checklistItems?.map(x=>({...x}))||[],defects:insp.defects||[]}));
        const uninsp=(insp.defects||[]).filter(x=>!x.status||x.status==="미조치").length;
        return `<div class="insp-pay-grid">
          <div class="insp-pay-sec">
            <h3>1. 공사 개요</h3>
            <div class="insp-pay-row"><label>발전소명</label><input id="payPN" value="${esc(insp.plantName||"")}"></div>
            <div class="insp-pay-row"><label>소재지</label><input id="payLoc" value="${esc(insp.location||"")}"></div>
            <div class="insp-pay-row"><label>지붕유형</label><input id="payRoof" value="${esc(insp.roofType||"")}"></div>
            <div class="insp-pay-row"><label>시공용량(kW)</label><input id="payCap" type="number" value="${insp.capacity||""}"></div>
            <div class="insp-pay-row"><label>시공완료 통보일</label><input id="payComp" type="date" value="${esc(insp.completionNoticeDate||"")}"></div>
            <div class="insp-pay-row"><label>외주업체명</label><input id="payContr" value="${esc(insp.contractor||"")}"></div>
          </div>
          <div class="insp-pay-sec">
            <h3>2. 검수 결과 (자동 산정)</h3>
            <div class="insp-pay-row"><label>검수일자</label><span>${esc(insp.inspectionDate||"-")}</span></div>
            <div class="insp-pay-row"><label>검수자</label><span>${esc(insp.inspector||"-")}</span></div>
            <div class="insp-pay-row"><label>총 검수항목 수</label><span>${tmp.totalEval}</span></div>
            <div class="insp-pay-row"><label>적합 항목 수</label><span style="color:#177245;font-weight:900">${tmp.passItems}</span></div>
            <div class="insp-pay-row"><label>부적합 항목 수</label><span style="color:#c93728;font-weight:900">${tmp.failItems}</span></div>
            <div class="insp-pay-row"><label>적합률(%)</label><span style="font-weight:900">${tmp.passRate}%</span></div>
            <div class="insp-pay-row"><label>하자 잔여(미조치)</label><span style="color:${uninsp>0?"#c93728":"#177245"};font-weight:900">${uninsp}건</span></div>
            <div class="insp-pay-row"><label>종합판정</label><span class="badge ${rCls(tmp.result)}">${esc(tmp.result)}</span></div>
          </div>
          <div class="insp-pay-sec">
            <h3>3. 입금 판단</h3>
            <div class="insp-pay-row"><label>입금 승인 여부</label>
              <select id="payApproval">
                ${["대기","승인","보류"].map(s=>`<option${insp.paymentApproval===s?" selected":""}>${s}</option>`).join("")}
              </select>
            </div>
            <div class="insp-pay-row"><label>판단 사유</label><input id="payReason" value="${esc(insp.paymentReason||"")}"></div>
            <div class="insp-pay-row"><label>입금 금액(원)</label><input id="payAmt" type="number" value="${insp.paymentAmount||""}"></div>
            <div class="insp-pay-row"><label>입금 예정일</label><input id="payDate" type="date" value="${esc(insp.paymentDate||"")}"></div>
            <div class="insp-pay-row"><label>특이사항</label><input id="payNote" value="${esc(insp.paymentNote||"")}"></div>
            <div style="font-size:11px;color:var(--muted);margin-top:6px">※ 하자 잔여 건수가 0건일 때만 '승인(전액입금)' 선택 가능</div>
          </div>
          <div class="insp-pay-sec">
            <h3>4. 결재</h3>
            <div class="insp-sign-grid">
              <div class="insp-sign-box"><div class="lbl">담당(검수자)</div><div class="name">${esc(insp.inspector||"–")}</div><div style="font-size:11px;color:var(--muted);margin-top:8px">일자: ${esc(insp.inspectionDate||"")}</div></div>
              <div class="insp-sign-box"><div class="lbl">팀장</div><div class="name" style="height:28px"></div><div style="font-size:11px;color:var(--muted);margin-top:8px">일자:</div></div>
              <div class="insp-sign-box"><div class="lbl">부서장/대표</div><div class="name" style="height:28px"></div><div style="font-size:11px;color:var(--muted);margin-top:8px">일자:</div></div>
            </div>
            <div style="margin-top:14px;text-align:right">
              <button class="btn" id="printPayBtn" type="button">🖨 확인서 인쇄</button>
            </div>
          </div>
        </div>`;
      }

      let _inspIdx=null,_inspTab="checklist";
      function getEditInsp(){return window.__editInsp}
      function setEditInsp(v){window.__editInsp=v}

      /* ── 모달 열기 ── */
      function openInspModal(idx){
        _inspIdx=idx;_inspTab="checklist";
        const insp=idx!==null?JSON.parse(JSON.stringify(state.structureInspections[idx])):blankInsp();
        setEditInsp(insp);
        let modal=document.getElementById("inspModalOverlay");
        if(!modal){
          document.body.insertAdjacentHTML("beforeend",`
            <div class="overlay" id="inspModalOverlay">
              <div class="modal" id="inspModal">
                <div class="modal-head">
                  <h2 id="inspModalTitle">검수 등록</h2>
                  <div class="row-actions" style="gap:8px">
                    <div style="position:relative">
                      <button class="btn" id="inspDbImportBtn" type="button" style="background:#ecfdf5;border-color:var(--teal);color:var(--teal);font-weight:900">📋 현장 불러오기</button>
                      <div id="inspDbPicker" style="display:none;position:absolute;right:0;top:38px;z-index:200;background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.15);width:360px;padding:12px">
                        <input id="inspDbSearch" placeholder="발전소명 검색..." style="width:100%;border:1px solid var(--line);border-radius:8px;padding:7px 10px;font-size:13px;box-sizing:border-box;margin-bottom:8px">
                        <div id="inspDbMergeRow" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:6px 8px;background:#f0fdf8;border-radius:8px;font-size:12px;color:#065f46">
                          <span id="inspDbSelCount">0개 선택됨</span>
                          <button type="button" id="structInspBulkBtn" class="btn primary" style="padding:4px 12px;font-size:12px">일괄 등록</button>
                        </div>
                        <div id="inspDbList" style="max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:4px"></div>
                      </div>
                    </div>
                    <button class="btn primary" id="saveInspBtn" type="button">저장</button>
                    <button class="btn icon" id="closeInspModalBtn" type="button">×</button>
                  </div>
                </div>
                <div id="inspModalBody" style="display:flex;flex-direction:column;overflow:hidden;flex:1;min-height:0">
                  <div class="insp-tabs" id="inspTabs"></div>
                  <div id="inspPanes" style="overflow:auto;flex:1;padding:0"></div>
                </div>
              </div>
            </div>`);
        }
        document.getElementById("inspModalTitle").textContent=idx!==null?`검수 수정 — ${insp.plantName||""}` : "새 검수 등록";
        renderInspModalContent();
        document.getElementById("inspModalOverlay").classList.add("open");
      }

      function renderInspModalContent(){
        const insp=getEditInsp();if(!insp)return;
        const tabDefs=[{id:"checklist",label:"체크리스트"},{id:"defect",label:"하자관리"},{id:"payment",label:"입금승인"}];
        document.getElementById("inspTabs").innerHTML=tabDefs.map(t=>`<button class="insp-tab${_inspTab===t.id?" active":""}" data-itab="${t.id}" type="button">${esc(t.label)}</button>`).join("");
        const panes=document.getElementById("inspPanes");
        if(_inspTab==="checklist"){
          panes.innerHTML=`<div class="insp-pane active" style="overflow:auto;padding:16px">
            <div class="insp-form-grid">
              <div><label>발전소명 *</label><input id="iPN" value="${esc(insp.plantName||"")}"></div>
              <div class="span2"><label>소재지</label><input id="iLoc" value="${esc(insp.location||"")}"></div>
              <div><label>지붕유형</label>
                <select id="iRoof">${["공장 지붕","축사 지붕","창고 지붕","기타"].map(x=>`<option${insp.roofType===x?" selected":""}>${esc(x)}</option>`).join("")}</select>
              </div>
              <div><label>용량(kW)</label><input id="iCap" type="number" step="0.01" value="${insp.capacity||""}"></div>
              <div><label>외주업체</label><input id="iContr" value="${esc(insp.contractor||"")}"></div>
              <div><label>계약금액(원)</label><input id="iAmt" type="number" value="${insp.contractAmount||""}"></div>
              <div><label>검수일자</label><input id="iDate" type="date" value="${esc(insp.inspectionDate||today)}"></div>
              <div><label>검수자</label><input id="iInsp" value="${esc(insp.inspector||loginName?.()||"")}"></div>
              <div><label>담당 입회자</label><input id="iSup" value="${esc(insp.fieldSupervisor||"")}"></div>
              <div><label>작업업체</label><input id="iWork" value="${esc(insp.workTeam||"")}"></div>
              <div><label>시공완료 통보일</label><input id="iComp" type="date" value="${esc(insp.completionNoticeDate||"")}"></div>
            </div>
            ${buildResultBarHtml(insp)}
            <div style="margin:8px 0 4px;text-align:right"><button type="button" id="allPassBtn" class="btn" style="background:#d1fae5;border-color:var(--teal);color:#065f46;font-weight:700;font-size:13px">✅ 전체 적합</button></div>
            ${buildChecklistHtml(insp)}
          </div>`;
        }else if(_inspTab==="defect"){
          panes.innerHTML=`<div class="insp-pane active" style="overflow:auto;padding:16px">${buildDefectHtml(insp)}</div>`;
        }else{
          panes.innerHTML=`<div class="insp-pane active" style="overflow:auto;padding:16px">${buildPaymentHtml(insp)}</div>`;
        }
      }

      function syncFormToInsp(){
        const insp=getEditInsp();if(!insp)return;
        if(_inspTab==="checklist"){
          insp.plantName=document.getElementById("iPN")?.value.trim()||insp.plantName;
          insp.location=document.getElementById("iLoc")?.value.trim()||insp.location;
          insp.roofType=document.getElementById("iRoof")?.value||insp.roofType;
          insp.capacity=Number(document.getElementById("iCap")?.value)||insp.capacity;
          insp.contractor=document.getElementById("iContr")?.value.trim()||insp.contractor;
          insp.contractAmount=Number(document.getElementById("iAmt")?.value)||insp.contractAmount;
          insp.inspectionDate=document.getElementById("iDate")?.value||insp.inspectionDate;
          insp.inspector=document.getElementById("iInsp")?.value.trim()||insp.inspector;
          insp.fieldSupervisor=document.getElementById("iSup")?.value.trim()||insp.fieldSupervisor;
          insp.workTeam=document.getElementById("iWork")?.value.trim()||insp.workTeam;
          insp.completionNoticeDate=document.getElementById("iComp")?.value||insp.completionNoticeDate;
          document.querySelectorAll("[data-id]").forEach(el=>{
            const no=Number(el.dataset.id),item=insp.checklistItems.find(x=>x.no===no);
            if(item)item.defect=el.value;
          });
        }else if(_inspTab==="payment"){
          const pa=document.getElementById("payApproval");if(pa)insp.paymentApproval=pa.value;
          const pr=document.getElementById("payReason");if(pr)insp.paymentReason=pr.value;
          const pamt=document.getElementById("payAmt");if(pamt)insp.paymentAmount=Number(pamt.value)||0;
          const pd=document.getElementById("payDate");if(pd)insp.paymentDate=pd.value;
          const pn=document.getElementById("payNote");if(pn)insp.paymentNote=pn.value;
          const pPN=document.getElementById("payPN");if(pPN)insp.plantName=pPN.value.trim()||insp.plantName;
          const pLoc=document.getElementById("payLoc");if(pLoc)insp.location=pLoc.value.trim()||insp.location;
          const pComp=document.getElementById("payComp");if(pComp)insp.completionNoticeDate=pComp.value;
        }
        calcResult(insp);
      }

      function saveInspFromModal(){
        syncFormToInsp();
        const insp=getEditInsp();if(!insp)return;
        if(!insp.plantName){toast("발전소명을 입력해주세요.");return}
        insp.savedAt=new Date().toISOString();
        if(_inspIdx!==null)state.structureInspections[_inspIdx]=insp;
        else state.structureInspections.unshift(insp);
        document.getElementById("inspModalOverlay")?.classList.remove("open");
        saveState("검수를 저장했습니다.");
        if(currentView==="structureInspect")renderInspView();
      }

      function printPayment(){
        syncFormToInsp();
        const insp=getEditInsp();if(!insp)return;
        const tmp=calcResult(Object.assign({},insp,{checklistItems:insp.checklistItems?.map(x=>({...x}))||[],defects:insp.defects||[]}));
        const uninsp=(insp.defects||[]).filter(x=>!x.status||x.status==="미조치").length;
        const html=`<div id="inspPrintRoot" style="max-width:720px;margin:auto;font-family:Arial,sans-serif;font-size:13px;line-height:1.6">
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px">
            <tr><th colspan="4" style="background:#eef8fa;padding:7px;border:1px solid #ccc;text-align:left">1. 공사 개요</th></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;width:22%;font-weight:bold">발전소명</td><td style="border:1px solid #ccc;padding:5px 8px">${esc(insp.plantName)}</td><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;width:22%;font-weight:bold">소재지</td><td style="border:1px solid #ccc;padding:5px 8px">${esc(insp.location)}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">지붕유형</td><td style="border:1px solid #ccc;padding:5px 8px">${esc(insp.roofType)}</td><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">시공용량(kW)</td><td style="border:1px solid #ccc;padding:5px 8px">${insp.capacity||"–"}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">시공완료 통보일</td><td style="border:1px solid #ccc;padding:5px 8px">${esc(insp.completionNoticeDate||"–")}</td><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">외주업체명</td><td style="border:1px solid #ccc;padding:5px 8px">${esc(insp.contractor||"–")}</td></tr>
          </table>
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px">
            <tr><th colspan="2" style="background:#eef8fa;padding:7px;border:1px solid #ccc;text-align:left">2. 검수 결과</th></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;width:44%;font-weight:bold">검수일자</td><td style="border:1px solid #ccc;padding:5px 8px">${esc(insp.inspectionDate||"–")}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">검수자</td><td style="border:1px solid #ccc;padding:5px 8px">${esc(insp.inspector||"–")}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">총 검수항목 수</td><td style="border:1px solid #ccc;padding:5px 8px">${tmp.totalEval}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">적합 항목 수</td><td style="border:1px solid #ccc;padding:5px 8px">${tmp.passItems}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">부적합 항목 수</td><td style="border:1px solid #ccc;padding:5px 8px">${tmp.failItems}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">적합률(%)</td><td style="border:1px solid #ccc;padding:5px 8px">${tmp.passRate}%</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">하자 잔여 건수(미조치)</td><td style="border:1px solid #ccc;padding:5px 8px">${uninsp}건</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">종합판정</td><td style="border:1px solid #ccc;padding:5px 8px;font-weight:bold;color:${tmp.result==="적합"?"#177245":tmp.result==="조건부적합"?"#a15c00":"#c93728"}">${esc(tmp.result)}</td></tr>
          </table>
          <table style="width:100%;border-collapse:collapse;margin-bottom:10px">
            <tr><th colspan="2" style="background:#eef8fa;padding:7px;border:1px solid #ccc;text-align:left">3. 입금 판단</th></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;width:44%;font-weight:bold">입금 승인 여부</td><td style="border:1px solid #ccc;padding:5px 8px;font-weight:bold">${esc(insp.paymentApproval||"대기")}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">판단 사유</td><td style="border:1px solid #ccc;padding:5px 8px">${esc(insp.paymentReason||"–")}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">입금 금액(원)</td><td style="border:1px solid #ccc;padding:5px 8px">${insp.paymentAmount?Number(insp.paymentAmount).toLocaleString()+"원":"–"}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">입금 예정일</td><td style="border:1px solid #ccc;padding:5px 8px">${esc(insp.paymentDate||"–")}</td></tr>
            <tr><td style="border:1px solid #ccc;padding:5px 8px;background:#f8f8f8;font-weight:bold">특이사항</td><td style="border:1px solid #ccc;padding:5px 8px">${esc(insp.paymentNote||"–")}</td></tr>
          </table>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr><th colspan="3" style="background:#eef8fa;padding:7px;border:1px solid #ccc;text-align:left">4. 결재</th></tr>
            <tr>
              <th style="border:1px solid #ccc;padding:10px;text-align:center;background:#f8f8f8;width:33%">담당(검수자)</th>
              <th style="border:1px solid #ccc;padding:10px;text-align:center;background:#f8f8f8;width:33%">팀장</th>
              <th style="border:1px solid #ccc;padding:10px;text-align:center;background:#f8f8f8;width:33%">부서장/대표</th>
            </tr>
            <tr>
              <td style="border:1px solid #ccc;padding:34px 10px;text-align:center">${esc(insp.inspector||"")}</td>
              <td style="border:1px solid #ccc;padding:34px 10px"></td>
              <td style="border:1px solid #ccc;padding:34px 10px"></td>
            </tr>
            <tr>
              <td style="border:1px solid #ccc;padding:5px;text-align:center;font-size:11px">일자: ${esc(insp.inspectionDate||"")}</td>
              <td style="border:1px solid #ccc;padding:5px;text-align:center;font-size:11px">일자: </td>
              <td style="border:1px solid #ccc;padding:5px;text-align:center;font-size:11px">일자: </td>
            </tr>
          </table>
        </div>`;
        const pw=window.open("","_blank","width=820,height=900");
        if(!pw){toast("팝업이 차단됐습니다. 팝업을 허용해주세요.");return;}
        pw.document.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>검수확인서 - ${esc(insp.plantName||"")}</title><style>*{box-sizing:border-box}body{margin:0;padding:20px;font-family:Arial,"Noto Sans KR",sans-serif;font-size:13px;line-height:1.6;color:#14212a;background:#eef2f4}.sheet{max-width:720px;margin:0 auto;background:#fff;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,.12)}@media print{@page{size:A4;margin:10mm}body{background:#fff;padding:0}.sheet{box-shadow:none;padding:0;max-width:none}.no-print{display:none!important}}h2{margin:0 0 4px;font-size:19px}.subtitle{text-align:center;font-size:11px;color:#888;margin-bottom:14px}table{width:100%;border-collapse:collapse;margin-bottom:10px}th,td{border:1px solid #ccc;padding:5px 8px}th{background:#eef8fa;text-align:left}td.lbl{background:#f8f8f8;font-weight:bold;width:44%}.sign-row td{height:56px;text-align:center;vertical-align:bottom;padding-bottom:6px}.date-row td{text-align:center;font-size:11px;color:#666}.toolbar{text-align:right;margin-bottom:14px}.toolbar button{background:#087d8f;color:#fff;border:0;border-radius:8px;padding:8px 18px;font-size:14px;font-weight:900;cursor:pointer}</style></head><body><div class="sheet"><div class="toolbar no-print"><button onclick="window.print()">인쇄 / PDF 저장</button></div><h2 style="text-align:center">구조물 시공 완료 검수 및 입금승인 확인서</h2><p class="subtitle">발행일: ${today} · 기술지원팀</p>${html}</div><script>setTimeout(()=>window.print(),300)<\/script></body></html>`);
        pw.document.close();
      }

      /* ── 렌더링 훅 ── */
      const baseRV_insp=renderView;
      renderView=function(){
        if(currentView==="structureInspect"){
          ensureInspChrome();
          renderInspView();
          document.getElementById("inspectionView")?.classList.remove("hidden");
          /* inline !important 로 체인 내부의 toggle("hidden",false) 를 덮어씀 */
          const toHide=[
            els.mainGrid,
            els.dashboardView,
            els.adminView,
            $("#kpis"),
            ...(["fieldworkView","meetingView","messageView","reportView","dbView","epcView"]
                .map(id=>document.getElementById(id))),
            $("#sharedNotice")
          ];
          toHide.forEach(el=>{if(el)el.style.setProperty("display","none","important")});
          document.body.className=document.body.className.replace(/\bview-\S+/g,"").trim();
          document.body.classList.add("view-structureInspect");
          renderNav?.();
          updateTopButtons?.();
          syncViewChrome?.();
          return;
        }
        /* 다른 뷰로 나올 때 inline style 제거 */
        [els.mainGrid,els.dashboardView,els.adminView,
         ...(["fieldworkView","meetingView","messageView","reportView","dbView","epcView"]
             .map(id=>document.getElementById(id))),
         $("#sharedNotice")
        ].forEach(el=>{if(el)el.style.removeProperty("display")});
        document.getElementById("inspectionView")?.classList.add("hidden");
        baseRV_insp();
      };

      const baseRC_insp=renderCurrentContent;
      renderCurrentContent=function(){
        if(currentView==="structureInspect"){syncViewChrome();renderInspView();return}
        baseRC_insp();
      };

      const baseSVC_insp=syncViewChrome;
      syncViewChrome=function(){
        baseSVC_insp();
        if(currentView==="structureInspect"){
          els.pageTitle.textContent="구조물 검수";
          els.pageSub.textContent="구조물 외주 시공 검수 체크리스트·하자보완·입금승인 관리";
          document.getElementById("addProjectBtn").textContent="+ 새 검수 등록";
        }
      };

      /* ── 이벤트 ── */
      document.addEventListener("click",e=>{
        const t=e.target.closest("button")||e.target;

        if(t.id==="newInspBtn"||(currentView==="structureInspect"&&t.id==="addProjectBtn")){
          e.preventDefault();e.stopImmediatePropagation();openInspModal(null);return;
        }
        if(t.dataset.openInsp!==undefined){e.preventDefault();e.stopImmediatePropagation();openInspModal(Number(t.dataset.openInsp));return;}
        if(t.dataset.editInsp!==undefined){e.preventDefault();e.stopImmediatePropagation();openInspModal(Number(t.dataset.editInsp));return;}
        if(t.dataset.deleteInsp!==undefined){
          e.preventDefault();e.stopImmediatePropagation();
          if(!confirm("이 검수 내역을 삭제할까요?"))return;
          state.structureInspections.splice(Number(t.dataset.deleteInsp),1);
          saveState("검수를 삭제했습니다.");renderInspView();return;
        }
        if(t.id==="closeInspModalBtn"){
          document.getElementById("inspModalOverlay")?.classList.remove("open");return;
        }

        /* 현장 불러오기 버튼 토글 */
        if(t.id==="inspDbImportBtn"){
          e.preventDefault();e.stopImmediatePropagation();
          const picker=document.getElementById("inspDbPicker");
          if(!picker)return;
          const isOpen=picker.style.display!=="none";
          picker.style.display=isOpen?"none":"block";
          if(!isOpen){
            _inspDbSel=new Set();
            const search=document.getElementById("inspDbSearch");
            if(search){search.value="";search.focus();}
            renderInspDbList("");
          }
          return;
        }

        /* 현장 항목 체크박스 토글 */
        if(t.dataset.inspDbSelect!==undefined||t.dataset.inspChk!==undefined){
          e.preventDefault();e.stopImmediatePropagation();
          const row=t.closest("[data-insp-db-select]")||t;
          const idx=Number(row.dataset.inspDbSelect??t.dataset.inspChk);
          if(isNaN(idx))return;
          if(_inspDbSel.has(idx))_inspDbSel.delete(idx);else _inspDbSel.add(idx);
          renderInspDbList(document.getElementById("inspDbSearch")?.value||"");
          return;
        }

        /* 일괄 등록 버튼 */
        if(t.id==="structInspBulkBtn"){
          e.preventDefault();e.stopImmediatePropagation();
          if(_inspDbSel.size===0)return;
          const src=(window.SOLAR_EPC_DATA&&window.SOLAR_EPC_DATA.projects)||[];
          const created=[];
          _inspDbSel.forEach(idx=>{
            const c=src[idx];if(!c)return;
            const insp=blankInsp();
            insp.plantName=c.plant||"";
            insp.location=c.region||"";
            insp.capacity=Number(c.capacity)||0;
            insp.contractor=c.corp||"";
            insp.workTeam=c.corp||"";
            insp.fieldSupervisor=c.manager||"";
            insp.completionNoticeDate=c.end||"";
            insp.savedAt=new Date().toISOString();
            created.push(insp);
          });
          state.structureInspections.unshift(...created);
          document.getElementById("inspDbPicker").style.display="none";
          document.getElementById("inspModalOverlay")?.classList.remove("open");
          saveState(`${created.length}개 검수를 일괄 등록했습니다.`);
          if(currentView==="structureInspect")renderInspView();
          return;
        }
        if(t.id==="saveInspBtn"){e.preventDefault();e.stopImmediatePropagation();saveInspFromModal();return;}

        /* 탭 전환 */
        if(t.dataset.itab){
          e.preventDefault();e.stopImmediatePropagation();
          syncFormToInsp();
          _inspTab=t.dataset.itab;
          renderInspModalContent();return;
        }

        /* 적합/부적합/해당없음 버튼 */
        if(t.dataset.iv!==undefined){
          e.preventDefault();e.stopImmediatePropagation();
          const insp=getEditInsp();if(!insp)return;
          const no=Number(t.dataset.iv),val=t.dataset.val;
          const item=insp.checklistItems.find(x=>x.no===no);
          if(item){
            const prevVerdict=item.verdict;
            item.verdict=item.verdict===val?"":val;
            if(!insp.defects)insp.defects=[];
            /* 부적합 → 자동 하자 등록 */
            if(item.verdict==="부적합"){
              const alreadyLinked=insp.defects.find(d=>d.checklistNo===no);
              if(!alreadyLinked){
                insp.defects.push({id:uid("def"),checklistNo:no,category:esc(item.cat||""),defect:item.item+(item.defect?`: ${item.defect}`:""),severity:"경",foundDate:today,deadlineDate:"",action:"",completionDate:"",confirmer:"",status:"미조치",note:""});
              }
            } else if(prevVerdict==="부적합"){
              /* 부적합 해제 → 자동 생성된 하자 삭제 */
              const idx=insp.defects.findIndex(d=>d.checklistNo===no&&d.status!=="완료");
              if(idx>=0)insp.defects.splice(idx,1);
            }
            calcResult(insp);
            /* 버튼 상태 업데이트 */
            document.querySelectorAll(`[data-iv="${no}"]`).forEach(b=>{
              b.classList.toggle("on",b.dataset.val===item.verdict);
            });
            /* 조치완료 버튼 토글 */
            const row=t.closest(".insp-row");
            if(row){
              let actionBtn=row.querySelector(".insp-action-btn");
              if(item.verdict==="부적합"&&!actionBtn){
                const btn=document.createElement("button");
                btn.type="button";btn.className="insp-vbtn insp-action-btn";
                btn.style.cssText="background:#e8faf0;color:#177245;border-color:#a8dfc0;font-size:10px";
                btn.textContent="✅ 조치완료";btn.dataset.ivComplete=no;
                row.querySelector(".insp-btns")?.appendChild(btn);
              } else if(item.verdict!=="부적합"&&actionBtn){
                actionBtn.remove();
              }
            }
            /* 결과 바 업데이트 */
            const bar=document.getElementById("inspResultBar");
            if(bar)bar.outerHTML=buildResultBarHtml(insp);
          }
          return;
        }

        /* 체크리스트 조치완료 버튼 */
        if(t.dataset.ivComplete!==undefined){
          e.preventDefault();e.stopImmediatePropagation();
          const insp=getEditInsp();if(!insp)return;
          const no=Number(t.dataset.ivComplete);
          const linked=insp.defects?.find(d=>d.checklistNo===no);
          if(linked){linked.status="완료";if(!linked.completionDate)linked.completionDate=today;}
          /* 체크리스트 판정도 적합으로 변경 */
          const item=insp.checklistItems.find(x=>x.no===no);
          if(item){item.verdict="적합";}
          calcResult(insp);
          /* 버튼 UI 갱신 */
          document.querySelectorAll(`[data-iv="${no}"]`).forEach(b=>{b.classList.toggle("on",b.dataset.val===item?.verdict);});
          t.closest(".insp-btns")?.querySelector(".insp-action-btn")?.remove();
          const bar=document.getElementById("inspResultBar");
          if(bar)bar.outerHTML=buildResultBarHtml(insp);
          toast("조치완료 처리했습니다.");
          return;
        }

        /* 전체 적합 토글 버튼 */
        if(t.id==="allPassBtn"){
          e.preventDefault();e.stopImmediatePropagation();
          const insp=getEditInsp();if(!insp)return;
          const allPass=insp.checklistItems.every(x=>x.verdict==="적합");
          if(allPass){
            insp.checklistItems.forEach(item=>{item.verdict="";});
            calcResult(insp);
            renderInspModalContent();
            toast("전체 적합 취소됐습니다.");
          }else{
            insp.checklistItems.forEach(item=>{item.verdict="적합";});
            calcResult(insp);
            renderInspModalContent();
            toast("모든 항목을 적합으로 설정했습니다.");
          }
          return;
        }

        /* 하자 추가 */
        if(t.id==="addDefectBtn"){
          e.preventDefault();e.stopImmediatePropagation();
          const insp=getEditInsp();if(!insp)return;
          const content=document.getElementById("dContent")?.value.trim()||"";
          if(!content){toast("하자 내용을 입력해주세요.");return}
          if(!insp.defects)insp.defects=[];
          insp.defects.push({
            id:uid("def"),
            category:document.getElementById("dCat")?.value.trim()||"",
            defect:content,
            severity:document.getElementById("dSev")?.value||"경",
            foundDate:document.getElementById("dFound")?.value||today,
            deadlineDate:document.getElementById("dDeadline")?.value||"",
            action:document.getElementById("dAction")?.value.trim()||"",
            completionDate:document.getElementById("dDone")?.value||"",
            confirmer:document.getElementById("dConfirmer")?.value.trim()||"",
            status:"미조치",note:""
          });
          calcResult(insp);
          const pane=document.getElementById("inspPanes");
          if(pane&&_inspTab==="defect")pane.innerHTML=`<div class="insp-pane active" style="overflow:auto;padding:16px">${buildDefectHtml(insp)}</div>`;
          return;
        }

        /* 하자 조치완료 (개별) */
        if(t.dataset.completeDefect!==undefined){
          e.preventDefault();e.stopImmediatePropagation();
          const insp=getEditInsp();if(!insp)return;
          const d=insp.defects[Number(t.dataset.completeDefect)];
          if(d){d.status="완료";if(!d.completionDate)d.completionDate=today;calcResult(insp);}
          const pane=document.getElementById("inspPanes");
          if(pane&&_inspTab==="defect")pane.innerHTML=`<div class="insp-pane active" style="overflow:auto;padding:16px">${buildDefectHtml(insp)}</div>`;
          const bar=document.getElementById("inspResultBar");
          if(bar)bar.outerHTML=buildResultBarHtml(insp);
          return;
        }

        /* 하자 전체 조치완료 */
        if(t.dataset.completeAllDefects!==undefined){
          e.preventDefault();e.stopImmediatePropagation();
          const insp=getEditInsp();if(!insp)return;
          (insp.defects||[]).forEach(d=>{if(d.status!=="완료"){d.status="완료";if(!d.completionDate)d.completionDate=today;}});
          calcResult(insp);
          const pane=document.getElementById("inspPanes");
          if(pane&&_inspTab==="defect")pane.innerHTML=`<div class="insp-pane active" style="overflow:auto;padding:16px">${buildDefectHtml(insp)}</div>`;
          const bar=document.getElementById("inspResultBar");
          if(bar)bar.outerHTML=buildResultBarHtml(insp);
          toast("모든 하자를 조치완료 처리했습니다.");
          return;
        }

        /* 하자 삭제 */
        if(t.dataset.delDefect!==undefined){
          e.preventDefault();e.stopImmediatePropagation();
          const insp=getEditInsp();if(!insp)return;
          insp.defects.splice(Number(t.dataset.delDefect),1);
          calcResult(insp);
          const pane=document.getElementById("inspPanes");
          if(pane)pane.innerHTML=`<div class="insp-pane active" style="overflow:auto;padding:16px">${buildDefectHtml(insp)}</div>`;
          return;
        }

        /* 인쇄 */
        if(t.id==="printPayBtn"){e.preventDefault();e.stopImmediatePropagation();printPayment();return;}
      },true);

      /* 하자 상태 드롭다운 변경 */
      document.addEventListener("change",e=>{
        const t=e.target;
        if(t.dataset.defectStatus!==undefined){
          const insp=getEditInsp();if(!insp)return;
          const d=insp.defects[Number(t.dataset.defectStatus)];
          if(d){
            d.status=t.value;
            if(t.value==="완료"&&!d.completionDate)d.completionDate=today;
            calcResult(insp);
          }
        }
      },true);

      /* 체크리스트 하자내용 실시간 동기화 */
      document.addEventListener("input",e=>{
        const t=e.target;
        if(t.dataset.id!==undefined&&t.classList.contains("insp-defect-in")){
          const insp=getEditInsp();if(!insp)return;
          const no=Number(t.dataset.id);
          const item=insp.checklistItems.find(x=>x.no===no);
          if(item){
            item.defect=t.value;
            /* 연결된 하자 항목 내용도 동기화 */
            const linked=(insp.defects||[]).find(d=>d.checklistNo===no);
            if(linked)linked.defect=item.item+(t.value?`: ${t.value}`:"");
          }
        }
      },true);

      /* 현장 불러오기 다중선택 상태 */
      let _inspDbSel=new Set();
      function _updateInspDbSelCount(){
        const cnt=document.getElementById("inspDbSelCount");
        if(cnt)cnt.textContent=`${_inspDbSel.size}개 선택됨`;
        const btn=document.getElementById("structInspBulkBtn");
        if(btn)btn.disabled=_inspDbSel.size===0;
      }

      /* 현장 불러오기 목록 렌더 (SOLAR_EPC_DATA 기반) */
      function renderInspDbList(q){
        const list=document.getElementById("inspDbList");if(!list)return;
        const src=(window.SOLAR_EPC_DATA&&window.SOLAR_EPC_DATA.projects)||[];
        const items=src.filter(c=>{
          const txt=[c.plant,c.corp,c.region,c.manager].join(" ").toLowerCase();
          return !q||txt.includes(q.toLowerCase());
        }).slice(0,50);
        if(!items.length){list.innerHTML=`<div style="padding:10px;color:#aaa;font-size:13px;text-align:center">검색 결과가 없습니다.</div>`;return;}
        list.innerHTML=items.map(c=>{
          const idx=src.indexOf(c);
          const chk=_inspDbSel.has(idx);
          return `<label data-insp-db-select="${idx}" style="display:flex;align-items:flex-start;gap:8px;background:${chk?"#d1fae5":"#f0fdf8"};border:1px solid ${chk?"var(--teal)":"var(--line)"};border-radius:8px;padding:8px 10px;cursor:pointer;width:100%;box-sizing:border-box;font-size:13px;line-height:1.5">
            <input type="checkbox" ${chk?"checked":""} data-insp-chk="${idx}" style="margin-top:2px;flex-shrink:0">
            <span><strong style="color:var(--teal)">${esc(c.plant||"이름 없음")}</strong>
            <span style="color:#999;font-size:11px;margin-left:4px">${esc(c.status||"")}</span><br>
            <span style="color:#666;font-size:12px">${esc(c.corp||"")}${c.region?` · ${esc(c.region)}`:""}${c.capacity?` · ${c.capacity}kW`:""}</span></span>
          </label>`;
        }).join("");
        _updateInspDbSelCount();
      }

      /* 현장 검색 입력 */
      document.addEventListener("input",e=>{
        if(e.target?.id==="inspDbSearch")renderInspDbList(e.target.value);
      },true);

      /* 피커 외부 클릭 시 닫기 */
      document.addEventListener("click",e=>{
        const picker=document.getElementById("inspDbPicker");
        if(picker&&picker.style.display!=="none"){
          if(!picker.contains(e.target)&&e.target?.id!=="inspDbImportBtn"){
            picker.style.display="none";
          }
        }
      },true);

      ensureInspChrome();ensureInspState();
    })();

    /* ══════════════════════════════════════════════════════
       시공배분 (월간 시공팀 배분 도구)  setupAllocationView
       - 다음 달 들어올 발전소 목록(수기 붙여넣기)
       - 시공사별 kW 균등 분산 + 지역 클러스터링 자동 배분
       - 한전협의 잠금(협의한 시공사 고정), 배분 초안 후 수정
    ══════════════════════════════════════════════════════ */
    (function setupAllocationView(){
      function nextMonthStr(){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;}
      function ensureAllocState(){
        if(!state.allocation||typeof state.allocation!=="object"||Array.isArray(state.allocation))state.allocation={month:nextMonthStr(),plants:[]};
        if(!state.allocation.month)state.allocation.month=nextMonthStr();
        if(!Array.isArray(state.allocation.plants))state.allocation.plants=[];
        state.allocation.plants.forEach(p=>{if(!p.id)p.id=uid("alc");p.kw=+p.kw||0;p.region=p.region||"";p.name=p.name||"";p.team=p.team||"";p.lockTeam=p.lockTeam||"";p.corp=p.corp||"";});
        /* nav 주입 (시공일정 뒤) — 사용자가 숨긴 경우는 제외 */
        const _allocHidden=Array.isArray(state.hiddenNavLabels)&&state.hiddenNavLabels.includes("시공배분");
        if(Array.isArray(state.nav)&&!_allocHidden&&!state.nav.some(n=>n.label==="시공배분")){
          const ci=state.nav.findIndex(n=>n.label.includes("시공일정"));
          const adminI=state.nav.findIndex(n=>n.label.includes("관리자"));
          const at=ci>=0?ci+1:(adminI>=0?adminI:state.nav.length);
          state.nav.splice(at,0,{icon:"⚖",label:"시공배분"});
        }
      }
      const baseNormAlc=normalizeState;
      normalizeState=function(){baseNormAlc();ensureAllocState();};
      const baseVFLAlc=viewForLabel;
      viewForLabel=function(lbl){return String(lbl||"").replace(/\s/g,"").includes("시공배분")?"alloc":baseVFLAlc(lbl);};
      const baseIsActAlc=isActive;
      isActive=function(lbl){return currentView==="alloc"?String(lbl||"").replace(/\s/g,"")==="시공배분":baseIsActAlc(lbl);};

      function shortRegion(r){r=String(r||"").trim();if(!r)return"";const m=r.match(/([가-힣]+(시|군|구))/g);if(m&&m.length)return m[m.length-1];const parts=r.split(/\s+/);return parts[parts.length-1]||r;}
      function dbReadiness(name){
        const src=(window.SOLAR_EPC_DATA&&window.SOLAR_EPC_DATA.projects)||[];
        if(!name)return null;const n=String(name).replace(/\s/g,"");
        const hit=src.find(p=>String(p.plant||"").replace(/\s/g,"")===n);
        if(!hit)return null;return{done:hit.completedStages||0,total:hit.totalStages||8,missing:hit.missingStages||[]};
      }

      function parseAllocPaste(text){
        const lines=String(text||"").split(/\r?\n/).map(l=>l.replace(/ /g," ").trim()).filter(Boolean);
        const out=[];
        for(const line of lines){
          const cols=line.split(/\t|,|;|\s{2,}/).map(c=>c.trim()).filter(c=>c!=="");
          if(!cols.length)continue;
          /* 헤더행 스킵 */
          if(/발전소|용량|지역|계열사/.test(line)&&!/\d{2,}/.test(line))continue;
          let name=cols[0],kw=0,kwIdx=-1,region="",corp="";
          for(let i=1;i<cols.length;i++){const raw=cols[i].replace(/[^0-9.]/g,"");const v=parseFloat(raw);if(!isNaN(v)&&v>0&&/\d/.test(cols[i])){kw=v;kwIdx=i;break;}}
          for(let i=1;i<cols.length;i++){if(i===kwIdx)continue;if(/(특별시|광역시|도|시|군|구)/.test(cols[i])){region=cols[i];break;}}
          for(let i=1;i<cols.length;i++){if(i===kwIdx)continue;if(cols[i]===region)continue;if(!/\d/.test(cols[i])){corp=cols[i];break;}}
          /* 계열사: 동광/다온/남해/다호 우선 인식 */
          const KNOWN_CORPS=["동광","다온","남해","다호"];
          for(let ci=1;ci<cols.length;ci++){if(ci===kwIdx||cols[ci]===region)continue;if(KNOWN_CORPS.includes(cols[ci])){corp=cols[ci];break;}}
          if(!name)continue;
          out.push({id:uid("alc"),name,kw,region,corp,team:"",lockTeam:""});
        }
        return out;
      }

      function allocAutoDistribute(){
        const a=state.allocation;if(!a||!a.plants.length){toast("배분할 발전소가 없습니다.");return;}
        const teams=(state.constructionTeams||[]).slice();
        if(!teams.length){toast("시공사가 없습니다. 관리자에서 추가해주세요.");return;}

        /* 지역 판별 */
        function isGN(r){return /경남|창원|진주|통영|사천|김해|밀양|거제|양산|함안|창녕|고성|남해|하동|산청|함양|거창|합천/.test(r||"");}
        function isGBeast(r){return /포항|경주|울진|영덕|영양|청송/.test(r||"");}
        function isGB(r){return /경북|안동|구미|영주|영천|상주|문경|경산|군위|의성|청도|고령|성주|칠곡|예천|봉화|울릉|포항|경주|울진|영덕|영양|청송/.test(r||"");}
        function isCC(r){return /충청|충북|충남|대전|세종|청주|천안|공주|보령|아산|서산|논산|계룡|당진|금산|부여|서천|청양|홍성|예산|태안|음성|진천|괴산|증평|충주|제천|보은|옥천|영동/.test(r||"");}

        /* 팀 목표 비율: 다호는 75% 배려 */
        function wt(t){return t==="다호"?0.75:1;}

        /* 지역 선호 점수 (단위 곱 적용, 음수=선호) */
        function rScore(t,r){
          const gn=isGN(r),gbe=isGBeast(r),gb=isGB(r),cc=isCC(r);
          if(t==="다호") return gn?-3:4;
          if(t==="동광") return gn?-2:gbe?-1.5:0;
          if(t==="다온") return gb?-2:cc?-1.5:0;
          if(t==="남해") return(!gn&&!gb&&!cc)?-2:0;
          return 0;
        }

        const load=Object.fromEntries(teams.map(t=>[t,0]));
        a.plants.forEach(p=>{if(!p.lockTeam)p.team="";});
        a.plants.forEach(p=>{if(p.lockTeam&&teams.includes(p.lockTeam)){p.team=p.lockTeam;load[p.lockTeam]+=(+p.kw||0);}});

        const rest=a.plants.filter(p=>!p.team).sort((x,y)=>(+y.kw||0)-(+x.kw||0));
        const unit=rest.reduce((s,p)=>s+(+p.kw||0),0)/Math.max(rest.length,1);

        for(const p of rest){
          let best=teams[0],score=Infinity;
          for(const t of teams){
            const s=(load[t]/wt(t))+(rScore(t,p.region||"")*unit);
            if(s<score){score=s;best=t;}
          }
          p.team=best;load[best]+=(+p.kw||0);
        }
        saveState("자동 배분했습니다.");renderAllocView();
      }
      function allocExportText(){
        const a=state.allocation;const teams=(state.constructionTeams||[]).slice();
        let out=`[${a.month||""} 시공 배분]\n`;
        const totAll=a.plants.reduce((s,p)=>s+(+p.kw||0),0);
        out+=`총 ${a.plants.length}건 / ${totAll.toFixed(1)}kW\n`;
        teams.forEach(t=>{
          const ps=a.plants.filter(p=>p.team===t);if(!ps.length)return;
          const tot=ps.reduce((s,p)=>s+(+p.kw||0),0);
          out+=`\n● ${t} — ${ps.length}건 / ${tot.toFixed(1)}kW\n`;
          ps.forEach(p=>{out+=`  · ${p.name} (${(+p.kw||0)}kW) ${p.region||""}${p.lockTeam?" [한전협의]":""}\n`;});
        });
        const un=a.plants.filter(p=>!p.team||!teams.includes(p.team));
        if(un.length){out+=`\n● 미배정 — ${un.length}건\n`;un.forEach(p=>{out+=`  · ${p.name} (${(+p.kw||0)}kW) ${p.region||""}\n`;});}
        return out;
      }

      function ensureAllocChrome(){
        if(!document.getElementById("allocationView")){
          const anchor=document.getElementById("inspectionView")||document.getElementById("meetingView")||els.dbView||els.adminView;
          anchor.insertAdjacentHTML("afterend",`<section class="panel hidden" id="allocationView"></section>`);
        }
        if(document.getElementById("allocStyle"))return;
        document.head.insertAdjacentHTML("beforeend",`<style id="allocStyle">
          #allocationView{box-shadow:none;background:transparent;border:0;padding:0}
          .alc-shell{display:grid;gap:14px}
          .alc-toolcard{background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:var(--shadow);padding:14px 16px}
          .alc-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
          .alc-tools input[type=month]{height:36px;border:1px solid var(--line);border-radius:8px;padding:0 10px;font-size:13px}
          .alc-summary{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
          .alc-chip{background:#f0fdf8;border:1px solid #a7f3d0;border-radius:999px;padding:5px 12px;font-size:12px;color:#065f46;font-weight:800}
          .alc-board{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
          .alc-col{background:#fff;border:1px solid var(--line);border-radius:10px;box-shadow:var(--shadow);display:flex;flex-direction:column;overflow:hidden;min-height:120px}
          .alc-col.un{background:#fff8f1;border-color:#fde2c8}
          .alc-col-head{padding:10px 12px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:6px;position:sticky;top:0;background:inherit}
          .alc-col-head h3{margin:0;font-size:14px;font-weight:900}
          .alc-col-head .kw{font-size:12px;color:var(--teal);font-weight:900}
          .alc-col.un .alc-col-head .kw{color:#c2710c}
          .alc-bar{height:5px;background:#eef4f3}.alc-bar>span{display:block;height:100%;background:var(--teal)}
          .alc-cards{padding:8px;display:flex;flex-direction:column;gap:7px;flex:1}
          .alc-card{border:1px solid var(--line);border-radius:8px;padding:8px 9px;background:#fbfdfd}
          .alc-card.locked{border-color:#f6b87a;background:#fff7ee}
          .alc-card .nm{font-size:13px;font-weight:800;display:flex;align-items:center;gap:5px;flex-wrap:wrap}
          .alc-card .mt{font-size:11px;color:var(--muted);margin-top:2px}
          .alc-rdy{font-size:10px;font-weight:800;border-radius:4px;padding:1px 5px}
          .alc-rdy.ok{background:#e8faf0;color:#177245}.alc-rdy.mid{background:#fff7e6;color:#a15c00}.alc-rdy.low{background:#fdecec;color:#c2410c}
          .alc-card-row{display:flex;gap:6px;align-items:center;margin-top:6px}
          .alc-card-row select{flex:1;height:30px;border:1px solid var(--line);border-radius:6px;font-size:12px;padding:0 6px;background:#fff}
          .alc-icon{border:1px solid var(--line);background:#fff;border-radius:6px;height:30px;min-width:30px;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;justify-content:center}
          .alc-icon.on{background:#f6b87a;border-color:#e0934a;color:#7a3d05}
          .alc-empty{padding:28px;text-align:center;color:var(--muted);font-size:13px}
          @media(max-width:600px){.alc-board{grid-template-columns:1fr}}
        </style>`);
      }

      function renderAllocView(){
        ensureAllocChrome();ensureAllocState();
        const host=document.getElementById("allocationView");if(!host)return;
        const a=state.allocation;const teams=(state.constructionTeams||[]).slice();
        const teamOpts=name=>`<option value="">미배정</option>`+teams.map(t=>`<option value="${esc(t)}"${name===t?" selected":""}>${esc(t)}</option>`).join("");
        const totAll=a.plants.reduce((s,p)=>s+(+p.kw||0),0);
        const loads=teams.map(t=>({t,ps:a.plants.filter(p=>p.team===t)}));
        const maxKw=Math.max(1,...loads.map(l=>l.ps.reduce((s,p)=>s+(+p.kw||0),0)));
        function cardHtml(p){
          const rdy=dbReadiness(p.name);
          let rb="";if(rdy){const cls=rdy.done>=rdy.total?"ok":rdy.done>=rdy.total-2?"mid":"low";rb=`<span class="alc-rdy ${cls}" title="${esc((rdy.missing||[]).join(', ')||'완료')}">서류 ${rdy.done}/${rdy.total}</span>`;}
          return `<div class="alc-card${p.lockTeam?" locked":""}" data-alc-id="${p.id}">
            <div class="nm">${esc(p.name)} ${rb}</div>
            <div class="mt">${(+p.kw||0)}kW · ${esc(p.region||"지역 미입력")}${p.corp?` · ${esc(p.corp)}`:""}${p.lockTeam?` · 🔒한전협의(${esc(p.lockTeam)})`:""}</div>
            <div class="alc-card-row">
              <select data-alloc-team="${p.id}">${teamOpts(p.team)}</select>
              <button class="alc-icon${p.lockTeam?" on":""}" data-alloc-lock="${p.id}" title="한전협의 고정(이 시공사에서 꼭 시공)">🔒</button>
              <button class="alc-icon" data-alloc-del="${p.id}" title="삭제">✕</button>
            </div>
          </div>`;
        }
        const colHtml=(name,ps,un)=>{
          const tot=ps.reduce((s,p)=>s+(+p.kw||0),0);
          return `<div class="alc-col${un?" un":""}">
            <div class="alc-col-head"><h3>${esc(name)}</h3><span class="kw">${ps.length}건 · ${tot.toFixed(1)}kW</span></div>
            <div class="alc-bar"><span style="width:${un?0:Math.round(tot/maxKw*100)}%"></span></div>
            <div class="alc-cards">${ps.length?ps.map(cardHtml).join(""):`<div class="alc-empty">비어 있음</div>`}</div>
          </div>`;
        };
        const unassigned=a.plants.filter(p=>!p.team||!teams.includes(p.team));
        let boardCols=teams.map(t=>colHtml(t,a.plants.filter(p=>p.team===t),false)).join("");
        boardCols+=colHtml("미배정",unassigned,true);
        const summary=teams.map(t=>{const tot=a.plants.filter(p=>p.team===t).reduce((s,p)=>s+(+p.kw||0),0);return `<span class="alc-chip">${esc(t)} ${tot.toFixed(0)}kW</span>`;}).join("")+(unassigned.length?`<span class="alc-chip" style="background:#fff1e6;border-color:#fdd0a8;color:#c2410c">미배정 ${unassigned.length}건</span>`:"");
        host.innerHTML=`<div class="alc-shell">
          <div class="alc-toolcard">
            <div class="alc-tools">
              <label style="font-size:12px;font-weight:800;color:var(--muted)">대상 월</label>
              <input type="month" id="allocMonth" value="${esc(a.month||"")}">
              <button class="btn primary" id="allocPasteBtn" type="button">📋 발전소 붙여넣기</button>
              <button class="btn" id="allocAutoBtn" type="button" style="background:#ecfdf5;border-color:var(--teal);color:var(--teal);font-weight:800">⚖ 자동 배분</button>
              <button class="btn" id="allocCopyBtn" type="button">📄 결과 복사</button>
              <button class="btn danger" id="allocClearBtn" type="button" style="margin-left:auto">전체 초기화</button>
            </div>
            <div class="alc-summary"><span class="alc-chip" style="background:#eef6ff;border-color:#bcd6f7;color:#1d4ed8">전체 ${a.plants.length}건 · ${totAll.toFixed(1)}kW</span>${summary}</div>
          </div>
          ${a.plants.length?`<div class="alc-board">${boardCols}</div>`:`<div class="alc-toolcard alc-empty">발전소 붙여넣기로 다음 달 시공 대상을 추가한 뒤 <b>자동 배분</b>을 눌러보세요.<br><span style="font-size:12px">생산관리 시트에서 [발전소명 / 용량(kW) / 지역 / (선택)계열사] 형식으로 복사해 붙여넣으면 됩니다.</span></div>`}
        </div>`;
        /* 전체 초기화 직접 바인딩 */
        const clearBtn=host.querySelector("#allocClearBtn");
        if(clearBtn)clearBtn.onclick=function(e){e.stopPropagation();if(confirm("배분 목록을 전체 삭제할까요?")){state.allocation.plants=[];saveState("초기화했습니다.");renderAllocView();}};
        /* X(삭제) 버튼 직접 바인딩 */
        host.querySelectorAll("[data-alloc-del]").forEach(function(btn){
          btn.onclick=function(e){e.stopPropagation();const id=btn.dataset.allocDel;const i=state.allocation.plants.findIndex(function(x){return x.id===id;});if(i>=0){state.allocation.plants.splice(i,1);saveState("삭제했습니다.");renderAllocView();}};
        });
      }

      function openAllocPasteModal(){
        let modal=document.getElementById("allocPasteOverlay");
        if(!modal){
          document.body.insertAdjacentHTML("beforeend",`<div class="overlay" id="allocPasteOverlay"><div class="modal" style="max-width:680px;width:96vw"><div class="modal-head"><h2>발전소 붙여넣기</h2><button class="btn icon" data-close="allocPasteOverlay" type="button">×</button></div>
            <p class="meta" style="margin:0 0 8px">생산관리 시트에서 복사해 붙여넣으세요. 한 줄에 발전소 하나씩, 열은 탭/쉼표로 구분합니다.<br><b>형식: 발전소명 [탭] 용량(kW) [탭] 지역 [탭] (선택)계열사</b></p>
            <textarea class="field" id="allocPasteText" style="min-height:200px;font-family:monospace;font-size:12px" placeholder="예)\n우암\t99.96\t경상북도 영천시\t파루\n성광2호\t442.9\t경남 밀양시\t키움"></textarea>
            <div id="allocPastePreview" class="meta" style="margin-top:8px"></div>
            <div class="toolbar" style="margin-top:12px;display:flex;gap:8px"><button class="btn" id="allocPreviewBtn" type="button">미리보기</button><button class="btn primary" id="allocApplyBtn" type="button">추가</button></div>
          </div></div>`);
        }
        document.getElementById("allocPasteText").value="";
        document.getElementById("allocPastePreview").textContent="";
        document.getElementById("allocPasteOverlay").classList.add("open");
      }

      /* ── 렌더링 훅 ── */
      const baseRV_alc=renderView;
      renderView=function(){
        if(currentView==="alloc"){
          ensureAllocChrome();renderAllocView();
          document.getElementById("allocationView")?.classList.remove("hidden");
          const toHide=[els.mainGrid,els.dashboardView,els.adminView,$("#kpis"),
            ...(["fieldworkView","meetingView","messageView","reportView","dbView","epcView","inspectionView"].map(id=>document.getElementById(id))),
            $("#sharedNotice")];
          toHide.forEach(el=>{if(el)el.style.setProperty("display","none","important")});
          document.body.className=document.body.className.replace(/\bview-\S+/g,"").trim();
          document.body.classList.add("view-alloc");
          renderNav?.();updateTopButtons?.();syncViewChrome?.();
          return;
        }
        document.getElementById("allocationView")?.classList.add("hidden");
        [els.mainGrid,els.dashboardView,els.adminView,$("#kpis"),
         ...(["fieldworkView","meetingView","messageView","reportView","dbView","epcView","inspectionView"].map(id=>document.getElementById(id))),
         $("#sharedNotice")].forEach(el=>{if(el&&el.style.getPropertyValue("display")==="none"&&currentView!=="structureInspect")el.style.removeProperty("display")});
        baseRV_alc();
      };
      const baseRC_alc=renderCurrentContent;
      renderCurrentContent=function(){if(currentView==="alloc"){renderAllocView();return}baseRC_alc();};
      const baseSVC_alc=syncViewChrome;
      syncViewChrome=function(){baseSVC_alc();if(currentView==="alloc"){els.pageTitle.textContent="시공배분";els.pageSub.textContent="다음 달 시공 대상을 시공사별로 균등·근접 배분합니다.";const b=document.getElementById("addProjectBtn");if(b)b.textContent="📋 발전소 붙여넣기";}};

      /* ── 이벤트 ── */
      document.addEventListener("click",e=>{
        const t=e.target.closest("button")||e.target;
        if(currentView==="alloc"&&t.id==="addProjectBtn"){e.preventDefault();e.stopImmediatePropagation();openAllocPasteModal();return;}
        if(t.id==="allocPasteBtn"){e.preventDefault();e.stopImmediatePropagation();openAllocPasteModal();return;}
        if(t.id==="allocAutoBtn"){e.preventDefault();e.stopImmediatePropagation();allocAutoDistribute();return;}
        if(t.id==="allocClearBtn"){e.preventDefault();e.stopImmediatePropagation();if(confirm("배분 목록을 전체 삭제할까요?")){state.allocation.plants=[];saveState("초기화했습니다.");renderAllocView();}return;}
        if(t.id==="allocCopyBtn"){e.preventDefault();e.stopImmediatePropagation();const txt=allocExportText();navigator.clipboard?.writeText(txt).then(()=>toast("결과를 복사했습니다."),()=>toast("복사 실패"));return;}
        if(t.id==="allocPreviewBtn"){e.preventDefault();e.stopImmediatePropagation();const items=parseAllocPaste(document.getElementById("allocPasteText").value);document.getElementById("allocPastePreview").innerHTML=items.length?`<b style="color:var(--teal)">${items.length}건 인식됨</b> — ${items.slice(0,5).map(p=>`${esc(p.name)}(${p.kw}kW)`).join(", ")}${items.length>5?" …":""}`:`<span style="color:#c2410c">인식된 항목이 없습니다. 형식을 확인해주세요.</span>`;return;}
        if(t.id==="allocApplyBtn"){e.preventDefault();e.stopImmediatePropagation();const items=parseAllocPaste(document.getElementById("allocPasteText").value);if(!items.length){toast("인식된 발전소가 없습니다.");return;}ensureAllocState();state.allocation.plants.push(...items);document.getElementById("allocPasteOverlay").classList.remove("open");saveState(`${items.length}건 추가했습니다.`);renderAllocView();return;}
        if(t.dataset.allocLock!==undefined){e.preventDefault();e.stopImmediatePropagation();const p=state.allocation.plants.find(x=>x.id===t.dataset.allocLock);if(p){if(p.lockTeam){p.lockTeam="";}else{if(!p.team){toast("먼저 시공사를 지정해주세요.");return;}p.lockTeam=p.team;}saveState(p.lockTeam?"한전협의 고정했습니다.":"고정 해제했습니다.");renderAllocView();}return;}
        if(t.dataset.allocDel!==undefined){e.preventDefault();e.stopImmediatePropagation();const i=state.allocation.plants.findIndex(x=>x.id===t.dataset.allocDel);if(i>=0){state.allocation.plants.splice(i,1);saveState("삭제했습니다.");renderAllocView();}return;}
      },true);

      document.addEventListener("change",e=>{
        const t=e.target;
        if(t.dataset.allocTeam!==undefined){const p=state.allocation.plants.find(x=>x.id===t.dataset.allocTeam);if(p){p.team=t.value;if(p.lockTeam&&p.lockTeam!==t.value)p.lockTeam=t.value?t.value:"";saveState("배정을 변경했습니다.");renderAllocView();}return;}
        if(t.id==="allocMonth"){ensureAllocState();state.allocation.month=t.value;saveState("대상 월을 변경했습니다.");return;}
      },true);

      ensureAllocChrome();ensureAllocState();
    })();

    (function patchSearchIme(){
      /* 주요 검색 입력창에 한글 조합 중 렌더링 방지 */
      let composing=false;
      document.addEventListener("compositionstart",e=>{
        if(e.target?.classList?.contains("search")||e.target?.id==="search")composing=true;
      },true);
      document.addEventListener("compositionend",e=>{
        if(e.target?.classList?.contains("search")||e.target?.id==="search"){
          composing=false;
          /* compositionend 후 input 이벤트 강제 발생 → 정상 렌더링 트리거 */
          e.target.dispatchEvent(new Event("input",{bubbles:true}));
        }
      },true);
      /* 기존 search 입력의 input 이벤트에서 조합 중이면 skip */
      const origInput=document.addEventListener;
      document.addEventListener("input",e=>{
        if(composing&&(e.target?.classList?.contains("search")||e.target?.id==="search"))e.stopImmediatePropagation();
      },true);
    })();

    /* ── 업무일지 탭 및 엑셀 출력 ── */
    (function setupWorkDiary(){
      let diaryDate=today;
      let diaryPerson="";
      const DIARY_SHEET_KEY="solar-diary-sheet-url-v1";

      function getDiarySheetUrl(){return localStorage.getItem(DIARY_SHEET_KEY)||"";}
      function setDiarySheetUrl(url){localStorage.setItem(DIARY_SHEET_KEY,url.trim());}

      /* ── 구글 시트 동기화 ── */
      async function syncDiaryToSheet(date,person,memo){
        const url=getDiarySheetUrl();
        if(!url){openDiarySheetSetup();return;}
        const rows=diaryTodos(date,person).map(t=>({
          title:t.title,type:t.type||"일반업무",project:t.project||"",
          status:statusLabel(t.status),priority:t.priority||"보통",
          result:t.result||"",detail:t.detail||""
        }));
        const btn=document.getElementById("diarySyncBtn");
        if(btn){btn.textContent="저장 중...";btn.disabled=true;}
        try{
          const payload=JSON.stringify({action:"save",date,person,rows,memo:memo||""});
          const res=await fetch(url,{method:"POST",
            headers:{"Content-Type":"application/x-www-form-urlencoded"},
            body:"payload="+encodeURIComponent(payload)});
          const json=await res.json();
          if(json.ok){
            toast(`✅ 구글 시트에 저장됐습니다 (${date} · ${person})`);
            if(btn){btn.textContent="✅ 구글 시트 저장됨";btn.style.background="#1a8c4e";}
            setTimeout(()=>{if(btn){btn.textContent="구글 시트 저장";btn.style.background="";btn.disabled=false;}},3000);
          }else{throw new Error(json.error||"저장 실패");}
        }catch(err){
          toast("❌ 구글 시트 저장 실패: "+err.message);
          if(btn){btn.textContent="구글 시트 저장";btn.disabled=false;}
        }
      }

      /* ── 시트 URL 설정 모달 ── */
      function openDiarySheetSetup(){
        document.getElementById("diarySheetSetupModal")?.remove();
        const el=document.createElement("div");
        el.id="diarySheetSetupModal";
        el.innerHTML=`<div class="overlay open" style="z-index:10001;">
          <div class="modal" style="max-width:540px;">
            <div class="modal-head"><h2>구글 시트 연동 설정</h2><button class="btn icon" id="closeDiarySheetSetupBtn">×</button></div>
            <div style="padding:4px 0 16px;color:#65737d;font-size:14px;line-height:1.7;">
              <strong style="color:#08245c;">Apps Script 배포 URL</strong>을 아래에 붙여넣으세요.<br>
              <span style="font-size:12px;">(<code>업무일지_GoogleAppsScript.gs</code> 파일을 script.google.com에 배포한 URL)</span>
            </div>
            <input class="field" id="diarySheetUrlInput" placeholder="https://script.google.com/macros/s/.../exec" value="${esc(getDiarySheetUrl())}" style="margin-bottom:12px;">
            <div style="display:flex;gap:8px;">
              <button class="btn primary" id="saveDiarySheetUrlBtn">저장 및 연결 테스트</button>
              <button class="btn" id="closeDiarySheetSetupBtn2">취소</button>
            </div>
            <div id="diarySheetTestResult" style="margin-top:12px;font-size:13px;"></div>
            <hr style="margin:16px 0;border-color:#e0ecef;">
            <details style="font-size:12px;color:#65737d;">
              <summary style="cursor:pointer;font-weight:600;color:#08245c;">📋 배포 방법 보기</summary>
              <ol style="margin:10px 0 0 16px;line-height:2;">
                <li><a href="https://script.google.com" target="_blank">script.google.com</a> 접속 → 새 프로젝트</li>
                <li>바탕화면 <code>기술지원팀_업무관리</code> 폴더의 <code>업무일지_GoogleAppsScript.gs</code> 내용 전체 복사 후 붙여넣기</li>
                <li>상단 메뉴 <strong>배포 → 새 배포</strong></li>
                <li>유형: <strong>웹 앱</strong> / 실행 계정: <strong>나</strong> / 액세스: <strong>모든 사용자(익명 포함)</strong></li>
                <li>배포 클릭 → 권한 허용 → URL 복사 후 위에 붙여넣기</li>
              </ol>
            </details>
          </div>
        </div>`;
        document.body.appendChild(el);
        document.getElementById("diarySheetUrlInput")?.focus();
      }

      function currentDiaryPerson(){
        if(diaryPerson)return diaryPerson;
        const name=loginName();
        return name||(state.people[0]?.name||"");
      }

      function diaryTodos(date,person){
        return state.todos.map(t=>normalizeTodo(t)).filter(t=>{
          const matchDate=(t.due&&t.due===date)||(t.start&&t.start===date);
          const matchPerson=!person||person===KR.all||taskPeople(t).includes(person);
          return matchDate&&matchPerson;
        });
      }

      function statusLabel(s){
        if(s===KR.done||s==="완료")return"완료";
        if(s===KR.doing||s==="진행중")return"진행중";
        if(s===KR.todo||s==="할 일")return"예정";
        if(s==="취소"||s===KR.cancel)return"취소";
        return s||"예정";
      }

      function exportWorkDiaryExcel(){
        const date=diaryDate;
        const person=currentDiaryPerson();
        const rows=diaryTodos(date,person);
        const dateStr=date.replace(/-/g,".");
        const title="기술지원팀 업무일지";
        const cellStyle="border:1px solid #d0dde3;padding:8px;vertical-align:top;";
        const headerStyle="border:1px solid #9fb6c1;background:#e7f6f8;padding:9px 8px;font-weight:bold;text-align:center;";
        const cols=["No","업무구분","업무내용","현장/프로젝트","상태","우선순위","마감일","처리내용/결과","비고"];
        const tableRows=rows.map((t,i)=>`<tr>
          <td style="${cellStyle}text-align:center;">${i+1}</td>
          <td style="${cellStyle}">${esc(t.type||"일반업무")}</td>
          <td style="${cellStyle}"><b>${esc(t.title)}</b>${t.detail?`<br><span style="color:#65737d;font-size:11px;">${esc(t.detail)}</span>`:""}</td>
          <td style="${cellStyle}">${esc(t.project||"일반업무")}</td>
          <td style="${cellStyle}text-align:center;"><b>${esc(statusLabel(t.status))}</b></td>
          <td style="${cellStyle}text-align:center;">${esc(t.priority||"보통")}</td>
          <td style="${cellStyle}text-align:center;">${esc(t.due||date)}</td>
          <td style="${cellStyle}">${esc(t.result||"")}</td>
          <td style="${cellStyle}">${esc(t.location||"")}</td>
        </tr>`).join("");
        const emptyRows=rows.length<5?Array.from({length:5-rows.length},()=>`<tr>${cols.map((_,ci)=>`<td style="${cellStyle}${ci===0?"text-align:center;":""}"> </td>`).join("")}</tr>`).join(""):"";
        const html=`<html><head><meta charset="utf-8"></head><body>
          <table style="border-collapse:collapse;font-family:맑은고딕,Arial;font-size:13px;min-width:900px;">
            <tr><td colspan="${cols.length}" style="font-size:18px;font-weight:bold;color:#08245c;padding:10px 8px 4px;border:none;">${esc(title)}</td></tr>
            <tr><td colspan="${cols.length}" style="font-size:12px;color:#65737d;padding:2px 8px 12px;border:none;">작성일: ${esc(dateStr)} &nbsp;|&nbsp; 작성자: ${esc(person)} &nbsp;|&nbsp; 부서: 기술지원팀</td></tr>
            <thead><tr>${cols.map(h=>`<th style="${headerStyle}">${esc(h)}</th>`).join("")}</tr></thead>
            <tbody>${tableRows||`<tr><td colspan="${cols.length}" style="${cellStyle}text-align:center;color:#aaa;">해당 날짜의 업무 항목이 없습니다.</td></tr>`}${emptyRows}</tbody>
            <tr><td colspan="${cols.length}" style="${cellStyle}font-size:12px;color:#65737d;">서명: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 확인: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>
          </table></body></html>`;
        const blob=new Blob(["﻿"+html],{type:"application/vnd.ms-excel;charset=utf-8"});
        const a=document.createElement("a");
        a.href=URL.createObjectURL(blob);
        a.download=`업무일지_${person}_${date}.xls`;
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(a.href),1000);
        toast(`업무일지(${date})를 엑셀로 내보냈습니다.`);
      }

      function toEmbedUrl(url){
        if(!url)return"";
        // 구글 시트 URL을 embed URL로 변환
        const m=url.match(/\/spreadsheets\/d\/([^\/]+)/);
        if(!m)return url;
        const id=m[1];
        const gidM=url.match(/[#&]gid=(\d+)/);
        const gid=gidM?gidM[1]:"";
        return`https://docs.google.com/spreadsheets/d/${id}/pubhtml${gid?`?gid=${gid}&single=true&widget=true&headers=false`:"?widget=true&headers=false"}`;
      }

      function loadSheetFrame(tab){
        const frame=document.getElementById("sheetViewerFrame");
        if(!frame)return;
        const dbUrl=localStorage.getItem("sheet-viewer-db-url")||"";
        const diaryUrl=localStorage.getItem("sheet-viewer-diary-url")||"";
        const url=tab==="db"?toEmbedUrl(dbUrl):toEmbedUrl(diaryUrl);
        if(!url){
          frame.srcdoc=`<div style="padding:40px;text-align:center;font-family:sans-serif;color:#888;">URL이 설정되지 않았습니다.<br>상단 ⚙ 설정 버튼을 눌러 구글 시트 URL을 입력하세요.</div>`;
        }else{
          frame.src=url;
          frame.srcdoc="";
        }
      }

      function openSheetViewer(){
        document.getElementById("sheetViewerModal")?.remove();
        const dbUrl=localStorage.getItem("sheet-viewer-db-url")||"";
        const diaryUrl=localStorage.getItem("sheet-viewer-diary-url")||"";
        const needSetup=!dbUrl&&!diaryUrl;
        const el=document.createElement("div");
        el.id="sheetViewerModal";
        const linkBtn=(label,url,color)=>url
          ?`<a href="${esc(url)}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:10px;padding:14px 18px;background:#fff;border:1.5px solid ${color};border-radius:10px;text-decoration:none;color:#08245c;font-weight:700;font-size:14px;transition:.12s;" onmouseover="this.style.background='${color}22'" onmouseout="this.style.background='#fff'">
              <span style="font-size:22px;">📊</span>
              <div><div>${esc(label)}</div><div style="font-size:11px;font-weight:400;color:#65737d;margin-top:2px;">${esc(url.length>60?url.slice(0,60)+"…":url)}</div></div>
              <span style="margin-left:auto;font-size:12px;color:${color};">새 탭으로 열기 →</span>
            </a>`
          :`<div style="padding:14px 18px;background:#f8f8f8;border:1.5px dashed #ccc;border-radius:10px;color:#aaa;font-size:13px;">URL 미설정 — 아래 설정에서 입력하세요</div>`;
        el.innerHTML=`
          <div class="overlay open" style="z-index:10002;padding:16px;">
            <div class="modal" style="max-width:600px;width:96vw;padding:0;overflow:hidden;">
              <div class="modal-head" style="padding:14px 18px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #e0ecef;">
                <span style="font-weight:800;font-size:15px;color:#08245c;">📊 구글 시트 바로가기</span>
                <button class="btn" id="sheetViewerSetupToggle" style="margin-left:auto;font-size:12px;padding:4px 10px;">⚙ URL 설정</button>
                <button class="btn icon" id="closeSheetViewerBtn" style="font-size:18px;">×</button>
              </div>
              <div style="padding:18px;display:grid;gap:12px;">
                ${linkBtn("업무일지",diaryUrl,"#087d8f")}
                ${linkBtn("기술지원팀 업무관리 DB",dbUrl,"#4285f4")}
              </div>
              <div id="svSetupArea" style="display:${needSetup?"":"none"};padding:16px;border-top:1px solid #e0ecef;background:#f8fcff;">
                <div style="font-size:13px;color:#08245c;font-weight:700;margin-bottom:10px;">구글 시트 URL 설정</div>
                <div style="display:grid;gap:8px;">
                  <div>
                    <label style="font-size:12px;font-weight:600;color:#65737d;display:block;margin-bottom:4px;">업무일지 시트 URL</label>
                    <input id="svDiaryUrlInput" class="field" style="width:100%;font-size:13px;" placeholder="https://docs.google.com/spreadsheets/d/.../edit" value="${esc(diaryUrl)}">
                  </div>
                  <div>
                    <label style="font-size:12px;font-weight:600;color:#65737d;display:block;margin-bottom:4px;">업무관리 DB 시트 URL</label>
                    <input id="svDbUrlInput" class="field" style="width:100%;font-size:13px;" placeholder="https://docs.google.com/spreadsheets/d/.../edit" value="${esc(dbUrl)}">
                  </div>
                  <button class="btn primary" id="saveSheetViewerUrlsBtn">저장</button>
                </div>
              </div>
            </div>
          </div>`;
        document.body.appendChild(el);
        el.addEventListener("click",e=>{if(e.target===el.querySelector(".overlay"))document.getElementById("sheetViewerModal")?.remove();});
      }

      function renderDiaryPanel(){
        const panel=$("#todoBoardPanel");
        if(!panel)return;
        const person=currentDiaryPerson();
        const rows=diaryTodos(diaryDate,person);
        const people=[KR.all,...state.people.map(p=>p.name)];
        const personTabs=people.map(p=>`<button class="todo-chip ${(diaryPerson===p||(diaryPerson===""&&p===person))?"active":""}" data-diary-person="${esc(p)}">${esc(p)}</button>`).join("");
        const todoCards=rows.length?rows.map(t=>`
          <div class="todo-card ${todoStatusClass(t.status)}" style="${esc(todoCardStyle(t))}">
            <div class="todo-card-title">${esc(t.title)}</div>
            <div class="todo-card-meta"><span class="color-dot" style="background:${esc(personColor(t.owner))}"></span>${esc(peopleText(t))} · ${esc(t.priority||KR.normal)} · ${esc(t.type||KR.general)}</div>
            ${t.detail?`<div class="todo-card-meta">${esc(t.detail)}</div>`:""}
            ${t.result?`<div class="todo-card-meta"><b>결과</b> ${esc(t.result)}</div>`:""}
            <span class="badge ${statusClass(t.status)}" style="margin-top:6px;display:inline-block;">${esc(statusLabel(t.status))}</span>
          </div>`).join(""):`<div class="meta" style="padding:24px 0;color:#9ab0b8;width:100%;">해당 날짜의 업무 항목이 없습니다.<br><span style="font-size:12px;">할일에 마감일을 설정하면 업무일지에 자동으로 표시됩니다.</span></div>`;
        panel.classList.remove("hidden");
        panel.innerHTML=`
          <div class="todo-toolbar">
            <div class="todo-view">
              <button data-todo-view="board" class="${todoViewMode==="board"?"active":""}">보드</button>
              <button data-todo-view="list" class="${todoViewMode==="list"?"active":""}">목록</button>
              <button data-todo-view="diary" class="active">업무일지</button>
            </div>
            <button class="btn primary" id="todoAddBtn">할일 추가</button>
            <button class="btn" id="todoExportDbBtn">목록 엑셀</button>
            <button class="btn" id="diaryExportBtn" style="background:#087d8f;color:#fff;font-weight:bold;">엑셀 저장</button>
            <button class="btn" id="diarySyncBtn" style="background:${getDiarySheetUrl()?"#1a8c4e":"#34a853"};color:#fff;font-weight:bold;">${getDiarySheetUrl()?"✅ 구글 시트 저장":"구글 시트 저장"}</button>
            <button class="btn" id="diarySheetSettingBtn" style="font-size:11px;padding:4px 8px;" title="구글 시트 연동 설정">⚙ 시트 설정</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:10px 0 4px;flex-wrap:wrap;">
            <button class="btn icon" id="diaryPrevBtn">&#8249;</button>
            <strong style="font-size:15px;min-width:110px;text-align:center;">${esc(diaryDate)}</strong>
            <button class="btn icon" id="diaryNextBtn">&#8250;</button>
            <button class="btn" id="diaryTodayBtn">오늘</button>
            <input type="date" id="diaryDateInput" value="${esc(diaryDate)}" style="border:1px solid #d0dde3;border-radius:6px;padding:5px 8px;font-size:13px;">
          </div>
          <div class="todo-chips" style="margin-bottom:6px;">${personTabs}</div>
          <div style="display:flex;flex-wrap:wrap;gap:12px;padding:8px 0;">${todoCards}</div>
          <div style="margin-top:16px;border-top:1px solid #e0ecef;padding-top:12px;">
            <label style="font-weight:600;font-size:13px;color:#08245c;display:block;margin-bottom:6px;">✏ 오늘 업무 메모 (구글 시트에 함께 저장)</label>
            <textarea id="diaryMemoInput" class="field" style="min-height:70px;font-size:13px;" placeholder="특이사항, 총평, 내일 할 일 등을 자유롭게 입력하세요...">${esc(state._diaryMemo?.[diaryDate]?.[person]||"")}</textarea>
          </div>
          <div style="margin-top:20px;border-top:1px solid #e0ecef;padding-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
            <button id="sheetViewerBtn" style="flex:1;min-width:140px;padding:12px;background:#4285f4;color:#fff;font-weight:700;font-size:14px;border:none;border-radius:10px;cursor:pointer;">📊 구글 시트 바로가기</button>
          </div>
          <div style="margin-top:14px;border-top:1px solid #e0ecef;padding-top:14px;">
            <details style="font-size:13px;color:#65737d;">
              <summary style="cursor:pointer;font-weight:700;color:#08245c;font-size:13px;user-select:none;">📖 업무일지 사용 방법</summary>
              <div style="margin-top:12px;display:grid;gap:10px;">
                <div style="background:#f0fdf8;border-left:3px solid #087d8f;padding:10px 14px;border-radius:0 8px 8px 0;">
                  <div style="font-weight:700;color:#087d8f;margin-bottom:4px;">🌅 아침 출근 시</div>
                  <div style="line-height:1.7;">"할일 추가" 버튼으로 오늘 업무를 등록합니다.<br><span style="color:#aaa;font-size:12px;">→ 마감일을 오늘로 설정하면 업무일지에 자동으로 표시됩니다.</span></div>
                </div>
                <div style="background:#f0fdf8;border-left:3px solid #087d8f;padding:10px 14px;border-radius:0 8px 8px 0;">
                  <div style="font-weight:700;color:#087d8f;margin-bottom:4px;">☀ 업무 중</div>
                  <div style="line-height:1.7;">보드(칸반) 탭에서 상태를 변경합니다.<br><span style="color:#aaa;font-size:12px;">할 일 → 진행중 → 완료</span></div>
                </div>
                <div style="background:#f0fdf8;border-left:3px solid #087d8f;padding:10px 14px;border-radius:0 8px 8px 0;">
                  <div style="font-weight:700;color:#087d8f;margin-bottom:4px;">🌙 퇴근 전</div>
                  <div style="line-height:1.7;">① 위 메모란에 특이사항·총평 입력<br>② 상단 담당자 탭에서 본인 이름 선택<br>③ <strong style="color:#08245c;">"구글 시트 저장"</strong> 버튼 클릭<br><span style="color:#aaa;font-size:12px;">→ 날짜별 실적이 구글 시트에 자동 누적됩니다.</span></div>
                </div>
                <div style="background:#fff8e6;border-left:3px solid #b86d13;padding:10px 14px;border-radius:0 8px 8px 0;font-size:12px;color:#7a5010;">
                  💡 <strong>팁:</strong> 구글 시트 연동이 안 됐다면 우측 상단 "시트 설정"에서 Apps Script URL을 먼저 등록하세요.
                </div>
              </div>
            </details>
          </div>`;
      }

      const _origRenderForDiary=renderTodoBoard;
      renderTodoBoard=function(){
        if(todoViewMode==="diary"){renderDiaryPanel();return;}
        _origRenderForDiary();
        const tview=$("#todoBoardPanel .todo-view");
        if(tview&&!tview.querySelector("[data-todo-view='diary']")){
          tview.insertAdjacentHTML("beforeend",`<button data-todo-view="diary">업무일지</button>`);
        }
        const toolbar=$("#todoBoardPanel .todo-toolbar");
      };

      document.addEventListener("click",e=>{
        const t=e.target.closest("button")||e.target;
        if(t.id==="diaryExportBtn"){e.preventDefault();e.stopImmediatePropagation();exportWorkDiaryExcel();return;}
        if(t.dataset.diaryPerson!==undefined){e.preventDefault();e.stopImmediatePropagation();diaryPerson=t.dataset.diaryPerson===KR.all?"":t.dataset.diaryPerson;renderDiaryPanel();return;}
        if(t.id==="diaryPrevBtn"){const d=new Date(diaryDate);d.setDate(d.getDate()-1);diaryDate=d.toISOString().slice(0,10);renderDiaryPanel();return;}
        if(t.id==="diaryNextBtn"){const d=new Date(diaryDate);d.setDate(d.getDate()+1);diaryDate=d.toISOString().slice(0,10);renderDiaryPanel();return;}
        if(t.id==="diaryTodayBtn"){diaryDate=today;renderDiaryPanel();return;}
        if(t.dataset.todoView==="diary"){e.preventDefault();e.stopImmediatePropagation();todoViewMode="diary";renderDiaryPanel();return;}
        /* 시트 보기 팝업 */
        if(t.id==="sheetViewerBtn"){e.preventDefault();e.stopImmediatePropagation();openSheetViewer();return;}
        if(t.id==="closeSheetViewerBtn"){document.getElementById("sheetViewerModal")?.remove();return;}
        if(t.dataset.sheetTab){
          document.querySelectorAll("[data-sheet-tab]").forEach(b=>b.classList.remove("active"));
          t.classList.add("active");
          loadSheetFrame(t.dataset.sheetTab);
          return;
        }
        if(t.id==="saveSheetViewerUrlsBtn"){
          const dbUrl=document.getElementById("svDbUrlInput")?.value.trim()||"";
          const diaryUrl=document.getElementById("svDiaryUrlInput")?.value.trim()||"";
          if(dbUrl)localStorage.setItem("sheet-viewer-db-url",dbUrl);
          if(diaryUrl)localStorage.setItem("sheet-viewer-diary-url",diaryUrl);
          openSheetViewer();
          return;
        }
        if(t.id==="sheetViewerSetupToggle"){
          const a=document.getElementById("svSetupArea");
          if(a)a.style.display=a.style.display==="none"?"":"none";
          return;
        }
        /* 구글 시트 저장 */
        if(t.id==="diarySyncBtn"){
          e.preventDefault();e.stopImmediatePropagation();
          const memo=document.getElementById("diaryMemoInput")?.value||"";
          const person=currentDiaryPerson();
          if(!state._diaryMemo)state._diaryMemo={};
          if(!state._diaryMemo[diaryDate])state._diaryMemo[diaryDate]={};
          state._diaryMemo[diaryDate][person]=memo;
          syncDiaryToSheet(diaryDate,person,memo);
          return;
        }
        /* 시트 설정 */
        if(t.id==="diarySheetSettingBtn"){e.preventDefault();e.stopImmediatePropagation();openDiarySheetSetup();return;}
        /* 시트 URL 저장 */
        if(t.id==="saveDiarySheetUrlBtn"){
          const url=document.getElementById("diarySheetUrlInput")?.value||"";
          if(!url.includes("script.google.com")){toast("올바른 Apps Script URL을 입력해주세요.");return;}
          setDiarySheetUrl(url);
          const res=document.getElementById("diarySheetTestResult");
          if(res)res.innerHTML="<span style='color:#1a8c4e;'>연결 테스트 중...</span>";
          fetch(url).then(r=>r.json()).then(j=>{
            if(res)res.innerHTML=`<span style='color:#1a8c4e;'>✅ 연결 성공: ${j.message||"OK"}</span>`;
            setTimeout(()=>{document.getElementById("diarySheetSetupModal")?.remove();renderDiaryPanel();},1200);
          }).catch(err=>{
            if(res)res.innerHTML=`<span style='color:#d87568;'>⚠ 연결 실패 (URL 재확인): ${err.message}</span>`;
          });
          return;
        }
        /* 설정 모달 닫기 */
        if(t.id==="closeDiarySheetSetupBtn"||t.id==="closeDiarySheetSetupBtn2"){document.getElementById("diarySheetSetupModal")?.remove();return;}
      },true);

      document.addEventListener("change",e=>{
        const t=e.target;
        if(t.id==="diaryDateInput"){diaryDate=t.value||today;renderDiaryPanel();}
      },true);
    })();



    (function setupGoogleCalendarSync(){
      const CAL_API="https://www.googleapis.com/calendar/v3";
      const SCOPE="https://www.googleapis.com/auth/calendar";
      const TOKEN_STORE="gcal_token_v1";
      let accessToken=null,tokenExpiresAt=0,tokenClient=null;
      function clientId(){return state.gcalClientId||""}
      function calendarId(){return state.gcalCalendarId||"primary"}
      function syncColor(){return state.gcalSyncColor||""}
      const GCAL_COLORS={"":"전체 (색상 무관)","9":"🟢 바질 (초록)","7":"🔵 공작새 (파랑)","1":"🪻 라벤더 (연보라)","2":"🌿 세이지 (연두)","3":"🍇 포도 (보라)","4":"🦩 플라밍고 (분홍)","5":"🍌 바나나 (노랑)","6":"🍊 귤 (주황)","8":"🫐 블루베리 (남색)","10":"🍅 토마토 (빨강)"};
      function isConnected(){return !!accessToken&&Date.now()<tokenExpiresAt}
      /* 토큰 복원 */
      (function(){try{const d=JSON.parse(localStorage.getItem(TOKEN_STORE)||"{}");if(d.t&&d.e>Date.now()+5000){accessToken=d.t;tokenExpiresAt=d.e}}catch(e){}}());
      function saveToken(t,expiresIn){accessToken=t;tokenExpiresAt=Date.now()+(expiresIn-60)*1000;localStorage.setItem(TOKEN_STORE,JSON.stringify({t:accessToken,e:tokenExpiresAt}))}
      function clearToken(){accessToken=null;tokenExpiresAt=0;localStorage.removeItem(TOKEN_STORE)}
      /* 직접 OAuth 팝업 방식 */
      const REDIRECT_URI="https://sisun1666-droid.github.io/http-127.0.0.1-7001-/";
      async function requestToken(){
        if(!clientId()){toast("관리자 설정에서 Google Client ID를 먼저 등록해주세요.");return false}
        if(isConnected())return true;
        return new Promise(resolve=>{
          const authUrl="https://accounts.google.com/o/oauth2/v2/auth"+
            "?client_id="+encodeURIComponent(clientId())+
            "&redirect_uri="+encodeURIComponent(REDIRECT_URI)+
            "&response_type=token"+
            "&scope="+encodeURIComponent(SCOPE)+
            "&prompt=select_account";
          const popup=window.open(authUrl,"gcalOAuth","width=520,height=620,left=200,top=100");
          if(!popup){toast("팝업이 차단됐습니다. 팝업 허용 후 다시 시도하세요.");resolve(false);return}
          const timer=setInterval(()=>{
            try{
              if(popup.closed){clearInterval(timer);resolve(false);return}
              const url=popup.location.href;
              if(url.startsWith(REDIRECT_URI)||url.startsWith("https://sisun1666-droid.github.io")){
                const hash=popup.location.hash.slice(1);
                const params=new URLSearchParams(hash);
                const token=params.get("access_token");
                const exp=parseInt(params.get("expires_in")||"3600");
                popup.close();clearInterval(timer);
                if(token){saveToken(token,exp);updateGcalBtn();resolve(true)}
                else{resolve(false)}
              }
            }catch(e){}
          },400);
        });
      }
      function disconnect(){clearToken();updateGcalBtn();toast("Google 캘린더 연결을 해제했습니다.")}
      /* 페이지 로드 시 만료된 토큰 조용히 정리 */
      if(accessToken&&!isConnected()){clearToken();}
      /* 1분마다 토큰 만료 확인 → 만료 시 토큰 정리 + 배너 갱신 */
      setInterval(()=>{
        if(accessToken&&!isConnected()){clearToken();updateGcalBtn();renderGcalBanner();}
      },60*1000);
      /* Todo → Calendar 이벤트 변환 */
      function todoToEvent(t){const start=t.start||t.due||today,end=t.due||start;const colorMap={"긴급":"11","높음":"6","완료":"2","진행중":"7","취소":"8","백로그":"8"};const colorId=colorMap[t.priority]==="11"?"11":colorMap[t.status];const body={summary:t.title||"할일",description:[t.detail,t.result?`✅ 결과: ${t.result}`:""].filter(Boolean).join("\n\n"),extendedProperties:{private:{kiwoomTodoId:t.id||"",kiwoomStatus:t.status||"",kiwoomOwner:t.owner||""}}};if(colorId)body.colorId=colorId;if(t.location)body.location=t.location;if(t.allDay!==false){const endD=new Date(end);endD.setDate(endD.getDate()+1);body.start={date:start};body.end={date:endD.toISOString().slice(0,10)}}else{const st=t.startTime||"09:00",et=t.endTime||"10:00";body.start={dateTime:`${start}T${st}:00`,timeZone:"Asia/Seoul"};body.end={dateTime:`${end}T${et}:00`,timeZone:"Asia/Seoul"}}return body}
      /* Calendar API 호출 */
      async function gcalFetch(path,opts={}){const r=await fetch(CAL_API+path,{...opts,headers:{Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json",...(opts.headers||{})}});if(r.status===204)return null;if(!r.ok)throw new Error(await r.text());return r.json()}
      async function gcalCreate(t){const ev=await gcalFetch("/calendars/"+encodeURIComponent(calendarId())+"/events",{method:"POST",body:JSON.stringify(todoToEvent(t))});return ev?.id}
      async function gcalUpdate(gcalId,t){await gcalFetch(`/calendars/${encodeURIComponent(calendarId())}/events/${gcalId}`,{method:"PUT",body:JSON.stringify(todoToEvent(t))})}
      async function gcalDelete(gcalId){await gcalFetch(`/calendars/${encodeURIComponent(calendarId())}/events/${gcalId}`,{method:"DELETE"})}
      /* Todo 동기화 */
      async function syncTodoToGcal(t){if(!isConnected()||!t)return;try{if(t.gcalEventId){await gcalUpdate(t.gcalEventId,t)}else{const id=await gcalCreate(t);if(id){t.gcalEventId=id;saveStateAfterPaint()}}}catch(e){console.warn("gcal sync:",e)}}
      async function removeTodoFromGcal(gcalId){if(!isConnected()||!gcalId)return;try{await gcalDelete(gcalId)}catch(e){}}
      /* 구글 → 앱 가져오기 */
      function todayStartISO(){return new Date(today+"T00:00:00+09:00").toISOString()}
      async function pullFromGcal(){
        if(!await requestToken())return;
        const colorNote=syncColor()?` (색상필터: ${GCAL_COLORS[syncColor()]||syncColor()})`:"";
        toast("구글 캘린더에서 가져오는 중..."+colorNote);
        try{
          const data=await gcalFetch(`/calendars/${encodeURIComponent(calendarId())}/events?timeMin=${todayStartISO()}&maxResults=300&singleEvents=true&orderBy=startTime&showDeleted=false`);
          const events=data?.items||[];
          let added=0;
          events.forEach(ev=>{
            if(ev.status==="cancelled")return;
            if(calendarId()==="primary"&&syncColor()&&(ev.colorId||"")!==syncColor())return;
            if(state.todos.some(t=>t.gcalEventId===ev.id))return;
            const start=ev.start?.date||ev.start?.dateTime?.slice(0,10)||today;
            const end=ev.end?.date||ev.end?.dateTime?.slice(0,10)||start;
            state.todos.unshift(normalizeTodo({title:ev.summary||"구글 캘린더 일정",detail:ev.description||"",location:ev.location||"",start,due:end,status:"할 일",gcalEventId:ev.id,allDay:!!ev.start?.date}));
            added++;
          });
          if(added>0){saveStateAfterPaint(`구글 캘린더에서 ${added}건 가져왔습니다.`);render()}
          toast(added>0?`${added}건을 할일로 가져왔습니다.`:`새로운 일정이 없습니다.${calendarId()==="primary"&&syncColor()?" (색상 필터 적용중)":""}`);
        }catch(e){toast("가져오기 실패: "+e.message)}
      }
      /* 전체 할일 → 구글 캘린더 업로드 */
      async function pushAllToGcal(){if(!await requestToken())return;const todos=state.todos.filter(t=>t.status!=="취소");toast(`${todos.length}건 구글 캘린더에 업로드 중...`);let ok=0;for(const t of todos){try{await syncTodoToGcal(t);ok++}catch(e){}}saveStateAfterPaint();toast(`${ok}건 업로드 완료`)}
      /* 자동 pull (연결된 경우에만, 특정 캘린더 선택된 경우에만) */
      async function autoPullFromGcal(){
        if(!isConnected())return;
        if(!state.gcalCalendarId)return; /* 캘린더 미선택 시 pull 안함 */
        try{
          /* 오늘 00:00부터 가져와야 오늘 등록한 이벤트도 포함됨 */
          const data=await gcalFetch(`/calendars/${encodeURIComponent(calendarId())}/events?timeMin=${todayStartISO()}&maxResults=300&singleEvents=true&orderBy=startTime&showDeleted=false`);
          const events=data?.items||[];
          let added=0;
          events.forEach(ev=>{
            if(ev.status==="cancelled")return;
            if(calendarId()==="primary"&&syncColor()&&(ev.colorId||"")!==syncColor())return; /* 색상 필터: primary 캘린더에서만 적용 */
            if(state.todos.some(t=>t.gcalEventId===ev.id))return;
            const start=ev.start?.date||ev.start?.dateTime?.slice(0,10)||today;
            const end=ev.end?.date||ev.end?.dateTime?.slice(0,10)||start;
            const newTodo=normalizeTodo({title:ev.summary||"구글 캘린더 일정",detail:ev.description||"",location:ev.location||"",start,due:end,status:"할 일",gcalEventId:ev.id,allDay:!!ev.start?.date});
            state.todos.unshift(newTodo);added++;
          });
          if(added>0){saveStateAfterPaint(`구글 캘린더에서 ${added}건 자동 가져왔습니다.`);render();toast(`📅 구글 캘린더에서 ${added}건 자동 가져왔습니다.`)}
        }catch(e){console.warn("gcal auto-pull:",e)}
      }
      /* 자동 pull - 색상 필터 적용, 30초 후 첫 실행, 이후 5분마다 */
      setTimeout(autoPullFromGcal,30000);
      setInterval(autoPullFromGcal,5*60*1000);
      /* UI 버튼 + 배너 상태 갱신 */
      function updateGcalBtn(){
        const btn=$("#gcalConnectBtn");
        if(!btn)return;
        if(!clientId()){btn.textContent="☁ 구글 캘린더 (Client ID 미설정)";btn.style.cssText="font-size:12px";btn.className="btn";return}
        if(isConnected()){btn.textContent="☁ 구글 연결됨 ✓";btn.style.cssText="font-size:12px;background:#0d9488;border-color:#0d9488;color:#fff";btn.className="btn"}
        else{btn.textContent="☁ 구글 재연결 필요";btn.style.cssText="font-size:12px;background:#ef4444;border-color:#ef4444;color:#fff;font-weight:700";btn.className="btn"}
        renderGcalBanner();
      }
      function renderGcalBanner(){
        const panel=$("#todoBoardPanel");if(!panel||currentView!=="todos")return;
        let banner=$("#gcalDisconnectBanner");
        if(isConnected()||!clientId()){if(banner)banner.remove();return;}
        if(!banner){
          panel.insertAdjacentHTML("afterbegin",`<div id="gcalDisconnectBanner" style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:12px"><span style="font-size:13px;font-weight:600;color:#b91c1c">⚠️ 구글 캘린더 연결이 끊어졌습니다. 토큰이 만료됐어요. (1시간마다 재연결 필요)</span><button id="gcalReconnectBannerBtn" style="background:#ef4444;color:#fff;border:0;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap">🔗 재연결</button></div>`);
          $("#gcalReconnectBannerBtn").onclick=async()=>{
            if(await requestToken()){toast("✅ 구글 캘린더 재연결됐습니다.");updateGcalBtn();autoPullFromGcal();}
          };
        }
      }
      /* 할일 툴바에 구글 캘린더 버튼 주입 */
      function injectGcalButtons(){if(currentView!=="todos")return;const toolbar=$("#todoBoardPanel .todo-toolbar");if(!toolbar||toolbar.querySelector("#gcalConnectBtn"))return;toolbar.insertAdjacentHTML("beforeend",`<span id="gcalBtnGroup" style="margin-left:auto;display:flex;gap:4px"><button id="gcalConnectBtn" class="btn" style="font-size:12px">☁ 구글 캘린더 연동</button><button id="gcalPullBtn" class="btn" style="font-size:12px" title="구글 캘린더 → 할일 가져오기">↓ 가져오기</button><button id="gcalPushBtn" class="btn" style="font-size:12px" title="모든 할일 → 구글 캘린더 업로드">↑ 전체 업로드</button></span>`);updateGcalBtn()}
      /* renderTodoBoard 래핑: 버튼 자동 주입 + 배너 갱신 */
      const baseRenderTodoBoardForGcal=renderTodoBoard;
      renderTodoBoard=function(){baseRenderTodoBoardForGcal();setTimeout(()=>{injectGcalButtons();renderGcalBanner();},0)};
      /* saveTodoBtn 래핑: 저장 후 구글 동기화 */
      const prevSaveTodo=$("#saveTodoBtn")?.onclick;
      if(prevSaveTodo){$("#saveTodoBtn").onclick=function(){const wasEditing=editingTodoIndex;prevSaveTodo.call(this);if(!isConnected())return;const saved=wasEditing===null?state.todos[0]:state.todos[wasEditing];if(saved)syncTodoToGcal(saved)}}
      /* deleteTodoAt 래핑: 삭제 전 구글에서도 제거 */
      const baseDeleteTodoAtForGcal=deleteTodoAt;
      deleteTodoAt=function(i){const t=state.todos[i];if(t?.gcalEventId)removeTodoFromGcal(t.gcalEventId);return baseDeleteTodoAtForGcal(i)};
      /* normalizeState: gcalClientId 초기값 */
      const baseNormalizeForGcal=normalizeState;
      normalizeState=function(){
        baseNormalizeForGcal();
        if(state.gcalClientId===undefined)state.gcalClientId="";
        if(state.gcalCalendarId===undefined)state.gcalCalendarId="";
        if(state.gcalSyncColor===undefined)state.gcalSyncColor="";
        /* 한번만 실행: 잘못 가져온 gcal 항목 자동 정리 (localStorage 사용 → Supabase 재로드에도 안 날아감) */
        if(!localStorage.getItem("gcalCleaned_v2")&&state.todos){
          const before=state.todos.length;
          state.todos=state.todos.filter(t=>!t.gcalEventId);
          localStorage.setItem("gcalCleaned_v2","1");
          if(state.todos.length<before){
            setTimeout(()=>{if(typeof persistState==="function"){persistState();toast("구글 캘린더 잘못 가져온 항목 "+(before-state.todos.length)+"건 자동 정리됐습니다.")}},500);
          }
        }
      };
      /* renderAdmin: Google Client ID 설정 카드 추가 */
      const baseRenderAdminForGcal=renderAdmin;
      async function loadCalendarList(){
        if(!isConnected())return[];
        try{const d=await gcalFetch("/users/me/calendarList?maxResults=50");return d?.items||[];}catch(e){return[];}
      }
      renderAdmin=function(){baseRenderAdminForGcal();if($("#gcalAdminCard"))return;const grid=$("#adminView .admin-grid");if(!grid)return;const colorOpts=Object.entries(GCAL_COLORS).map(([v,l])=>`<option value="${v}"${syncColor()===v?" selected":""}>${l}</option>`).join("");const calSel=isConnected()?`<label style="font-size:12px;color:#64748b;display:block;margin:10px 0 4px">동기화할 캘린더</label><select class="field" id="gcalCalendarSelect"><option value="primary">기본 캘린더 (primary)</option></select><button class="btn" id="gcalRefreshCalsBtn" style="margin-top:4px;font-size:12px">캘린더 목록 새로고침</button><label style="font-size:12px;color:#64748b;display:block;margin:10px 0 4px">📥 가져올 이벤트 색상 (이 색상만 앱으로 가져옴)</label><select class="field" id="gcalColorSelect">${colorOpts}</select>`:"";grid.insertAdjacentHTML("beforeend",`<div class="card" id="gcalAdminCard"><div class="panel-title"><h2>Google 캘린더 연동</h2></div><label style="font-size:12px;color:#64748b;display:block;margin-bottom:4px">OAuth 2.0 클라이언트 ID</label><input class="field" id="gcalClientIdInput" placeholder="123456789-xxx.apps.googleusercontent.com" value="${esc(state.gcalClientId||"")}"><div style="display:flex;gap:8px;margin-top:8px"><button class="btn primary" id="gcalSaveClientIdBtn">저장</button>${isConnected()?`<button class="btn danger" id="gcalDisconnectAdminBtn">연결 해제</button>`:""}</div>${calSel}<p class="meta" style="margin-top:8px">현재 상태: ${isConnected()?"<strong style='color:#16a34a'>연결됨</strong>":"<span style='color:#94a3b8'>미연결</span>"}</p></div>`);
        $("#gcalSaveClientIdBtn").onclick=()=>{state.gcalClientId=$("#gcalClientIdInput").value.trim();tokenClient=null;saveState("Google Client ID를 저장했습니다.");toast("저장됐습니다. 할일관리 탭에서 연동 버튼을 누르세요.")};
        const discBtn=$("#gcalDisconnectAdminBtn");if(discBtn)discBtn.onclick=()=>{disconnect();renderAdmin()};
        const sel=$("#gcalCalendarSelect");
        if(sel){
          (async()=>{
            const cals=await loadCalendarList();
            cals.forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=c.summary+(c.primary?" (기본)":"");if(c.id===(state.gcalCalendarId||"primary")||(!state.gcalCalendarId&&c.primary))o.selected=true;sel.appendChild(o)});
          })();
          sel.onchange=()=>{state.gcalCalendarId=sel.value;saveState();toast(`캘린더 변경: ${sel.options[sel.selectedIndex].text}`)};
        }
        const refBtn=$("#gcalRefreshCalsBtn");
        if(refBtn)refBtn.onclick=()=>{const card=$("#gcalAdminCard");if(card)card.remove();renderAdmin()};
        const colorSel=$("#gcalColorSelect");
        if(colorSel)colorSel.onchange=()=>{state.gcalSyncColor=colorSel.value;saveState();toast(`색상 필터: ${GCAL_COLORS[colorSel.value]||"전체"}`)};
      };
      /* 버튼 클릭 이벤트 */
      document.addEventListener("click",async e=>{const t=e.target.closest("button")||e.target;if(t.id==="gcalConnectBtn"){e.preventDefault();e.stopImmediatePropagation();if(isConnected()){if(confirm("Google 캘린더 연결을 해제할까요?"))disconnect()}else{if(await requestToken())toast("Google 캘린더에 연결됐습니다.");updateGcalBtn()}return}if(t.id==="gcalPullBtn"){e.preventDefault();e.stopImmediatePropagation();pullFromGcal();return}if(t.id==="gcalPushBtn"){e.preventDefault();e.stopImmediatePropagation();if(confirm(`할일 전체(${state.todos.filter(x=>x.status!=="취소").length}건)를 구글 캘린더에 업로드할까요?`))pushAllToGcal();return}},true);
      /* 스타일 */
      document.head.insertAdjacentHTML("beforeend",`<style id="gcalStyle">#gcalBtnGroup{flex-shrink:0}@media(max-width:600px){#gcalBtnGroup{display:none!important}}</style>`);
    })();


