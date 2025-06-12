// Base64 Analysis Functions
function analyzeBase64() {
    const base64Input = document.getElementById('base64Input').value.trim();
    const resultArea = document.getElementById('resultArea');
    const imagePreview = document.getElementById('imagePreview');
    const errorMessage = document.getElementById('errorMessage');
    const analysisDetails = document.getElementById('analysisDetails');

    resultArea.style.display = 'block';
    imagePreview.style.display = 'none';
    errorMessage.style.display = 'none';

    if (!base64Input) {
        showError('Base64 문자열을 입력해주세요');
        return;
    }

    // Check if the input is a valid base64 string
    if (!isValidBase64(base64Input)) {
        showError('잘못된 Base64 문자열 형식입니다');
        return;
    }

    // Try to display the image
    try {
        imagePreview.src = base64Input;
        imagePreview.style.display = 'block';
        
        // Analyze the base64 string
        const analysis = analyzeBase64String(base64Input);
        displayAnalysis(analysis);
    } catch (error) {
        showError('이미지 처리 중 오류가 발생했습니다: ' + error.message);
    }
}

function isValidBase64(str) {
    try {
        // Check if it's a data URL format
        if (!str.startsWith('data:image/')) {
            return false;
        }
        
        // Split the string to get the base64 part
        const parts = str.split(',');
        if (parts.length !== 2) {
            return false;
        }

        // Check if the base64 part exists and is not empty
        const base64Data = parts[1];
        if (!base64Data) {
            return false;
        }

        return true;
    } catch (err) {
        return false;
    }
}

function analyzeBase64String(base64Str) {
    const analysis = {
        format: '',
        size: 0,
        isTruncated: false,
        issues: []
    };

    // Extract the format
    const formatMatch = base64Str.match(/^data:([^;]+);/);
    if (formatMatch) {
        analysis.format = formatMatch[1];
    }

    // Calculate size
    const base64Data = base64Str.split(',')[1];
    analysis.size = Math.ceil((base64Data.length * 3) / 4);

    // Check for truncation
    if (base64Data.includes('...') || base64Data.length % 4 !== 0) {
        analysis.isTruncated = true;
        analysis.issues.push('Base64 문자열이 잘려있습니다. 이미지가 불완전할 수 있습니다.');
    }

    // Check for common issues
    if (analysis.size > 5 * 1024 * 1024) { // 5MB
        analysis.issues.push('이미지 크기가 매우 큽니다 (>5MB)');
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(analysis.format)) {
        analysis.issues.push('지원하지 않는 이미지 형식입니다');
    }

    return analysis;
}

function displayAnalysis(analysis) {
    const analysisDetails = document.getElementById('analysisDetails');
    let html = `
        <div class="analysis-item">
            <strong>형식:</strong> ${analysis.format || '알 수 없음'}
        </div>
        <div class="analysis-item">
            <strong>크기:</strong> ${formatSize(analysis.size)}
        </div>
        <div class="analysis-item">
            <strong>상태:</strong> ${analysis.isTruncated ? '⚠️ 잘림' : '✅ 완전함'}
        </div>
    `;

    if (analysis.issues.length > 0) {
        html += '<div class="analysis-issues">';
        html += '<strong>발견된 문제:</strong><ul>';
        analysis.issues.forEach(issue => {
            html += `<li>${issue}</li>`;
        });
        html += '</ul></div>';
    }

    analysisDetails.innerHTML = html;
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function formatSize(bytes) {
    if (bytes === 0) return '0 바이트';
    const k = 1024;
    const sizes = ['바이트', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// File Upload Functions
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
});

function handleFileUpload(file) {
    if (!file.type.startsWith('image/')) {
        showError('이미지 파일을 업로드해주세요');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64String = e.target.result;
        document.getElementById('convertedBase64').value = base64String;
        document.getElementById('conversionResult').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function copyToClipboard() {
    const textarea = document.getElementById('convertedBase64');
    textarea.select();
    document.execCommand('copy');
    alert('Base64 문자열이 클립보드에 복사되었습니다!');
}

function downloadAsFile() {
    const base64String = document.getElementById('convertedBase64').value;
    const link = document.createElement('a');
    link.href = base64String;
    link.download = 'image.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
} 