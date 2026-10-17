/**
 * 시뮬레이터 공통 템플릿 JS
 * 
 * 사용법:
 * 1. HTML에서 sim-template.css, sim-template.js 로드
 * 2. CONFIG 객체 정의
 * 3. SimTemplate.init(CONFIG) 호출
 */

const SimTemplate = {
  config: null,
  currentStage: 0,
  discoveredPrinciples: [],
  choices: [],

  /**
   * 초기화
   * @param {Object} config - 시뮬레이터 설정
   */
  init(config) {
    this.config = config;
    this.currentStage = 0;
    this.discoveredPrinciples = [];
    this.choices = [];
    
    this.renderStage(0);
    this.bindEvents();
  },

  /**
   * 스테이지 렌더링
   */
  renderStage(index) {
    const stage = this.config.stages[index];
    if (!stage) return;

    const total = this.config.stages.length;
    
    // 진행바 업데이트
    document.getElementById('stageLabel').textContent = `STAGE ${index + 1}`;
    document.getElementById('stageCount').textContent = `${index + 1}/${total}`;
    document.getElementById('progressFill').style.width = `${((index + 1) / total) * 100}%`;
    this.renderDots(index, total);
    
    // 뱃지
    document.getElementById('stageBadge').textContent = stage.badge || `STAGE ${index + 1}`;
    
    // 상황
    document.getElementById('situationTitle').textContent = stage.title;
    document.getElementById('situationDesc').innerHTML = stage.desc.replace(/\n/g, '<br>');
    
    // 하이라이트 (선택적)
    const highlightEl = document.getElementById('situationHighlight');
    if (stage.highlight) {
      highlightEl.innerHTML = stage.highlight;
      highlightEl.classList.remove('hidden');
    } else {
      highlightEl.classList.add('hidden');
    }
    
    // 인용구 (선택적)
    const quoteEl = document.getElementById('situationQuote');
    if (stage.quote) {
      quoteEl.innerHTML = stage.quote;
      quoteEl.classList.remove('hidden');
    } else {
      quoteEl.classList.add('hidden');
    }
    
    // 선택지 생성
    const choicesEl = document.getElementById('choices');
    choicesEl.innerHTML = stage.choices.map((choice, idx) => `
      <button class="sim-choice-btn" data-choice-id="${choice.id}">
        <div class="sim-choice-label">${String.fromCharCode(65 + idx)}</div>
        <div>${choice.text}</div>
        ${choice.subtext ? `<div class="sim-choice-subtext">${choice.subtext}</div>` : ''}
      </button>
    `).join('');
    
    // 선택지 이벤트
    // 누르면 잠깐 선택 표시를 보여 준 뒤 바로 해설 시트를 올린다
    this.locked = false;
    choicesEl.querySelectorAll('.sim-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.locked) return;
        this.locked = true;
        btn.classList.add('sel');
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setTimeout(() => this.handleChoice(btn.dataset.choiceId), reduce ? 0 : 220);
      });
    });
    
    // 화면 전환
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('explanationScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    this.setSheet(false);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * 선택 처리
   */
  handleChoice(choiceId) {
    const stage = this.config.stages[this.currentStage];
    const choice = stage.choices.find(c => c.id === choiceId);
    
    if (!choice) return;
    
    // 선택 기록
    this.choices.push({
      stage: this.currentStage,
      choiceId: choiceId,
      choiceText: choice.text
    });
    
    // 원칙 발견
    if (choice.principle) {
      this.discoveredPrinciples.push(choice.principle);
    }
    
    // 해설 화면 표시
    this.showExplanation(choice);
  },

  /**
   * 해설 화면 표시
   */
  showExplanation(choice) {
    // 당신의 선택
    document.getElementById('yourChoice').textContent = choice.text;
    
    // 이 선택이 의미하는 것
    document.getElementById('choiceMeaning').textContent = choice.meaning || '';
    const meaningCard = document.getElementById('meaningCard');
    if (choice.meaning) {
      meaningCard.classList.remove('hidden');
    } else {
      meaningCard.classList.add('hidden');
    }
    
    // 발견한 원칙
    const principleCard = document.getElementById('principleCard');
    if (choice.principle) {
      document.getElementById('principleName').textContent = choice.principle.name;
      document.getElementById('principleDesc').textContent = choice.principle.desc;
      principleCard.classList.remove('hidden');
    } else {
      principleCard.classList.add('hidden');
    }
    
    // 인용구
    const quoteCard = document.getElementById('quoteCard');
    if (choice.quote) {
      document.getElementById('quoteText').textContent = choice.quote;
      quoteCard.classList.remove('hidden');
    } else {
      quoteCard.classList.add('hidden');
    }
    
    // 화면 전환: 질문 화면 위로 해설 시트를 올린다
    document.getElementById('explanationScreen').classList.remove('hidden');
    document.getElementById('explanationScreen').scrollTop = 0;
    this.setSheet(true);
  },

  /**
   * 다음 스테이지로
   */
  renderDots(index, total) {
    const wrap = document.querySelector('.sim-progress');
    if (!wrap) return;
    let dots = wrap.querySelector('.sim-dots');
    if (!dots) { dots = document.createElement('div'); dots.className = 'sim-dots'; dots.setAttribute('aria-hidden', 'true'); wrap.prepend(dots); }
    dots.innerHTML = Array.from({ length: total }, (_, i) => `<i class="${i < index ? 'done' : i === index ? 'now' : ''}"></i>`).join('');
  },

  setSheet(open) {
    let scrim = document.querySelector('.sim-scrim');
    if (!scrim) { scrim = document.createElement('div'); scrim.className = 'sim-scrim'; scrim.hidden = true; document.body.appendChild(scrim); }
    scrim.hidden = !open;
    if (this.cta) this.cta.bar.hidden = open || !document.getElementById('resultScreen').classList.contains('hidden');
    document.body.style.overflow = open ? 'hidden' : '';
  },

  nextStage() {
    this.currentStage++;
    
    if (this.currentStage >= this.config.stages.length) {
      this.showResult();
    } else {
      this.renderStage(this.currentStage);
    }
  },

  /**
   * 결과 화면 표시
   */
  showResult() {
    // 결과 타입 계산 (설정에 따라)
    let resultType = null;
    
    if (this.config.calculateResult) {
      resultType = this.config.calculateResult(this.choices, this.discoveredPrinciples);
    } else if (this.config.results && this.config.results.default) {
      resultType = this.config.results.default;
    }
    
    if (resultType) {
      document.getElementById('resultIcon').textContent = resultType.icon || '✨';
      document.getElementById('resultLabel').textContent = resultType.label || '결과';
      document.getElementById('resultTitle').textContent = resultType.title;
      document.getElementById('resultDesc').innerHTML = resultType.desc.replace(/\n/g, '<br>');
      
      // 커스텀 통계 (있으면 표시)
      const statsContainer = document.getElementById('resultStats');
      if (statsContainer && resultType.stats) {
        statsContainer.innerHTML = resultType.stats.map(stat => `
          <div class="sim-result-stat">
            <div class="sim-result-stat-value">${stat.value}</div>
            <div class="sim-result-stat-label">${stat.label}</div>
          </div>
        `).join('');
        statsContainer.classList.remove('hidden');
      }
    }
    
    // 발견한 원칙들 목록
    const principlesList = document.getElementById('principlesList');
    if (this.discoveredPrinciples.length > 0) {
      principlesList.innerHTML = `
        <div class="sim-principles-list-title">발견한 원칙</div>
        ${this.discoveredPrinciples.map(p => `
          <div class="sim-principles-item">
            <div class="sim-principles-item-icon">${p.icon || '💡'}</div>
            <div>
              <div class="sim-principles-item-name">${p.name}</div>
              <div class="sim-principles-item-desc">${p.desc}</div>
            </div>
          </div>
        `).join('')}
      `;
      principlesList.classList.remove('hidden');
    } else {
      principlesList.classList.add('hidden');
    }
    
    // 프로필에 저장
    this.saveProgress();
    
    // 화면 전환
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('explanationScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    this.setSheet(false);
    if (this.cta) this.cta.bar.hidden = true;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * 진행 저장
   */
  saveProgress() {
    const STORAGE_KEY = 'eclipse_mindlab_profile';
    let saved = localStorage.getItem(STORAGE_KEY);
    let profile;
    
    if (saved) {
      profile = JSON.parse(saved);
    } else {
      // 프로필 없으면 새로 생성 (index.html과 동일한 구조)
      profile = { version: 5, name: '익명 탐험가', level: 1, exp: 0, completedSims: [], principles: [] };
    }
    
    if (!profile.completedSims) profile.completedSims = [];
    if (!profile.principles) profile.principles = [];
    
    // 완료 기록
    const simId = this.config.id;
    
    if (!profile.completedSims.includes(simId)) {
      profile.completedSims.push(simId);
      profile.exp = (profile.exp || 0) + 30;
    }
    
    // 원칙 저장 (이름으로 저장 - 도감과 매칭)
    // 기존 원칙 이름들 추출 (객체/문자열 모두 처리)
    const existingNames = profile.principles.map(p => 
      typeof p === 'string' ? p : p.name
    );
    
    this.discoveredPrinciples.forEach(p => {
      if (!existingNames.includes(p.name)) {
        profile.principles.push(p.name);
        existingNames.push(p.name);
      }
    });
    
    console.log('저장된 원칙:', profile.principles);
    console.log('발견한 원칙:', this.discoveredPrinciples.map(p => p.name));
    
    // 레벨업 체크
    const expNeeded = (profile.level || 1) * 100;
    while (profile.exp >= expNeeded) {
      profile.exp -= expNeeded;
      profile.level = (profile.level || 1) + 1;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  },

  /**
   * 공유하기
   */
  async share() {
    const resultTitle = document.getElementById('resultTitle').textContent;
    const principleNames = this.discoveredPrinciples.map(p => p.name).join(', ');
    
    // 커스텀 shareText 함수가 있으면 사용
    let text;
    if (this.config.getShareText) {
      text = this.config.getShareText(resultTitle, this.choices, this.discoveredPrinciples);
    } else {
      text = `${this.config.shareIcon || '🧠'} ${this.config.title} 결과

${resultTitle}

발견한 원칙: ${principleNames || '없음'}

${this.config.shareUrl || window.location.href}`;
    }
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && navigator.share) {
      try {
        await navigator.share({ title: this.config.title, text: text });
      } catch (e) {
        // 취소
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('결과가 클립보드에 복사되었습니다!');
      } catch (e) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('결과가 클립보드에 복사되었습니다!');
      }
    }
  },

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 다음 버튼
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStage());
    }
    
    // 공유 버튼
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.share());
    }
  }
};
