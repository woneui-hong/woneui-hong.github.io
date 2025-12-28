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
  
  // 변경된 파일 확인 (간단하게)
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    const lines = status.trim().split('\n').filter(line => line);
    
    if (lines.length === 0) {
      return `Update: ${dateStr}`;
    }
    
    // 새 포스트 파일이 있는지 확인
    const newPosts = lines.filter(line => 
      line.includes('content/posts/') && line.startsWith('??')
    );
    
    if (newPosts.length > 0) {
      const postName = newPosts[0].split('/').pop().replace('.md', '');
      return `Add new post: ${postName}`;
    }
    
    // 수정된 포스트가 있는지 확인
    const modifiedPosts = lines.filter(line => 
      line.includes('content/posts/') && line.startsWith(' M')
    );
    
    if (modifiedPosts.length > 0) {
      return `Update blog post: ${dateStr}`;
    }
    
    return `Update: ${dateStr}`;
  } catch (error) {
    return `Update: ${dateStr}`;
  }
}

try {
  console.log('🔄 Git add 실행 중...');
  execSync('git add .', { stdio: 'inherit' });
  
  const commitMessage = generateCommitMessage();
  console.log(`\n💬 커밋 메시지: ${commitMessage}`);
  console.log('📝 Git commit 실행 중...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  console.log('\n🚀 Git push 실행 중...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('\n✅ 성공적으로 배포되었습니다!');
} catch (error) {
  console.error('\n❌ 오류 발생:', error.message);
  process.exit(1);
}

