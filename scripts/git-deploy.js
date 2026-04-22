const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 자동 생성 커밋 메시지
function generateCommitMessage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    const lines = status.trim().split('\n').filter(line => line);
    
    if (lines.length === 0) {
      return `Update: ${dateStr}`;
    }
    
    // 변경된 파일들을 카테고리별로 분류
    const changes = {
      newPosts: [],
      modifiedPosts: [],
      components: [],
      pages: [],
      styles: [],
      config: [],
      scripts: [],
      other: []
    };
    
    lines.forEach(line => {
      // git status --porcelain 형식: "XY filename"
      // X: 스테이징 영역 상태, Y: 작업 디렉토리 상태
      // ' ' = 변경 없음, 'M' = 수정됨, 'A' = 추가됨, 'D' = 삭제됨, 'R' = 이름 변경됨, '?' = 추적 안됨
      const statusCode = line.substring(0, 2);
      const filePath = line.substring(3).trim();
      
      // 새 파일: ?? (추적 안됨) 또는 A (추가됨)
      const isNew = statusCode === '??' || statusCode.includes('A');
      
      // 수정된 파일: M (수정됨) - 스테이징 전( M), 스테이징 후(M ), 둘 다(MM)
      // 또는 R (이름 변경/이동) - R (스테이징됨), R (작업 디렉토리만)
      const isModified = statusCode.includes('M') || statusCode.includes('R');
      
      // 새 포스트 추가
      if (filePath.includes('content/posts/') && isNew) {
        const postName = filePath.split('/').pop().replace('.md', '');
        changes.newPosts.push(postName);
      }
      // 포스트 수정
      else if (filePath.includes('content/posts/') && isModified) {
        const postName = filePath.split('/').pop().replace('.md', '');
        changes.modifiedPosts.push(postName);
      }
      // 컴포넌트 변경
      else if (filePath.includes('src/components/')) {
        const componentName = filePath.split('/').pop().replace('.tsx', '').replace('.ts', '');
        changes.components.push(componentName);
      }
      // 페이지 변경
      else if (filePath.includes('src/app/')) {
        const pagePath = filePath.replace('src/app/', '').replace('/page.tsx', '').replace('page.tsx', '');
        changes.pages.push(pagePath || 'home');
      }
      // 스타일 변경
      else if (filePath.includes('globals.css') || 
               filePath.includes('tailwind.config') || 
               filePath.includes('postcss.config')) {
        changes.styles.push(filePath.split('/').pop());
      }
      // 설정 파일 변경
      else if (filePath.startsWith('config/') ||
               filePath.includes('package.json') || 
               filePath.includes('next.config') || 
               filePath.includes('tsconfig.json') ||
               filePath.includes('config/eslint.json')) {
        changes.config.push(filePath.split('/').pop());
      }
      // 스크립트 변경
      else if (filePath.includes('scripts/')) {
        const scriptName = filePath.split('/').pop();
        changes.scripts.push(scriptName);
      }
      // 기타
      else {
        changes.other.push(filePath);
      }
    });
    
    // 우선순위에 따라 메시지 생성
    const messages = [];
    
    // 1. 새 포스트 추가 (최우선)
    if (changes.newPosts.length > 0) {
      if (changes.newPosts.length === 1) {
        return `Add new post: ${changes.newPosts[0]}`;
      } else {
        return `Add ${changes.newPosts.length} new posts`;
      }
    }
    
    // 2. 포스트 수정
    if (changes.modifiedPosts.length > 0) {
      if (changes.modifiedPosts.length === 1) {
        return `Update post: ${changes.modifiedPosts[0]}`;
      } else {
        return `Update ${changes.modifiedPosts.length} posts`;
      }
    }
    
    // 3. 컴포넌트 변경
    if (changes.components.length > 0) {
      if (changes.components.length === 1) {
        return `Update component: ${changes.components[0]}`;
      } else {
        return `Update components: ${changes.components.join(', ')}`;
      }
    }
    
    // 4. 페이지 변경
    if (changes.pages.length > 0) {
      if (changes.pages.length === 1) {
        const pageName = changes.pages[0] === 'home' ? 'homepage' : changes.pages[0];
        return `Update page: ${pageName}`;
      } else {
        return `Update pages: ${changes.pages.join(', ')}`;
      }
    }
    
    // 5. 스타일 변경
    if (changes.styles.length > 0) {
      return `Update styles: ${changes.styles.join(', ')}`;
    }
    
    // 6. 설정 변경
    if (changes.config.length > 0) {
      return `Update config: ${changes.config.join(', ')}`;
    }
    
    // 7. 스크립트 변경
    if (changes.scripts.length > 0) {
      return `Update scripts: ${changes.scripts.join(', ')}`;
    }
    
    // 8. 복합 변경 (여러 카테고리)
    const changeTypes = [];
    if (changes.components.length > 0) changeTypes.push('components');
    if (changes.pages.length > 0) changeTypes.push('pages');
    if (changes.styles.length > 0) changeTypes.push('styles');
    if (changes.config.length > 0) changeTypes.push('config');
    if (changes.scripts.length > 0) changeTypes.push('scripts');
    
    if (changeTypes.length > 1) {
      return `Update site: ${changeTypes.join(', ')}`;
    }
    
    // 9. 기타 변경
    if (changes.other.length > 0) {
      return `Update: ${dateStr}`;
    }
    
    return `Update: ${dateStr}`;
  } catch (error) {
    return `Update: ${dateStr}`;
  }
}

try {
  // git add 전에 커밋 메시지 생성 (정확한 변경사항 파악을 위해)
  const commitMessage = generateCommitMessage();
  
  console.log('🔄 Git add 실행 중...');
  execSync('git add .', { stdio: 'inherit' });
  
  // 변경사항이 있는지 확인 (--cached는 스테이징된 변경사항 확인)
  let hasChanges = false;
  try {
    execSync('git diff --cached --quiet', { encoding: 'utf-8', stdio: 'ignore' });
    // exit code 0 = 변경사항 없음
    hasChanges = false;
  } catch (statusError) {
    // exit code 1 = 변경사항 있음
    hasChanges = true;
  }
  
  if (hasChanges) {
    console.log(`\n💬 커밋 메시지: ${commitMessage}`);
    console.log('📝 Git commit 실행 중...');
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  } else {
    console.log('\nℹ️  커밋할 변경사항이 없습니다.');
  }
  
  console.log('\n🚀 Git push 실행 중...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('\n✅ 성공적으로 배포되었습니다!');
} catch (error) {
  console.error('\n❌ 오류 발생:', error.message);
  process.exit(1);
}

