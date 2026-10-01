const { execSync } = require('child_process');
try {
    const out = execSync('npx rsbuild build', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    require('fs').writeFileSync('build_log.txt', out, 'utf8');
} catch (e) {
    const log = 'STDOUT:\n' + (e.stdout || '') + '\n\nSTDERR:\n' + (e.stderr || '');
    require('fs').writeFileSync('build_log.txt', log, 'utf8');
}
