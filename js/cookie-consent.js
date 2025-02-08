// Cookie 同意管理器
class CookieConsentManager {
    constructor() {
        this.cookieConsent = this.getCookieConsent();
        this.init();
    }

    init() {
        if (!this.cookieConsent) {
            this.showConsentBanner();
        }
        this.setupEventListeners();
    }

    // 获取 Cookie 同意状态
    getCookieConsent() {
        return JSON.parse(localStorage.getItem('cookieConsent') || 'null');
    }

    // 保存 Cookie 同意状态
    saveCookieConsent(preferences) {
        localStorage.setItem('cookieConsent', JSON.stringify(preferences));
        this.cookieConsent = preferences;
    }

    // 显示 Cookie 同意横幅
    showConsentBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <p>我们使用 Cookie 来改善您的浏览体验。您可以选择接受或拒绝非必要的 Cookie。
                   <a href="/cookie-policy.html">了解更多</a>
                </p>
                <div class="cookie-banner-buttons">
                    <button class="cookie-btn accept-all">接受所有</button>
                    <button class="cookie-btn customize">自定义设置</button>
                    <button class="cookie-btn accept-necessary">仅接受必要的</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        // 添加按钮事件监听器
        banner.querySelector('.accept-all').addEventListener('click', () => {
            this.acceptAll();
            this.hideBanner(banner);
        });

        banner.querySelector('.customize').addEventListener('click', () => {
            this.showCustomizeModal();
            this.hideBanner(banner);
        });

        banner.querySelector('.accept-necessary').addEventListener('click', () => {
            this.acceptNecessary();
            this.hideBanner(banner);
        });
    }

    // 隐藏横幅
    hideBanner(banner) {
        banner.style.animation = 'slideDown 0.5s forwards';
        setTimeout(() => banner.remove(), 500);
    }

    // 显示自定义设置模态框
    showCustomizeModal() {
        const modal = document.createElement('div');
        modal.className = 'cookie-modal';
        modal.innerHTML = `
            <div class="cookie-modal-content">
                <h2>Cookie 设置</h2>
                <div class="cookie-preferences">
                    <div class="cookie-option">
                        <label>
                            <input type="checkbox" name="necessary" checked disabled>
                            必要的 Cookie
                        </label>
                        <p>这些 Cookie 对于网站的基本功能是必需的，无法禁用。</p>
                    </div>
                    <div class="cookie-option">
                        <label>
                            <input type="checkbox" name="performance">
                            性能 Cookie
                        </label>
                        <p>这些 Cookie 帮助我们了解访问者如何使用网站，用于改进网站性能。</p>
                    </div>
                    <div class="cookie-option">
                        <label>
                            <input type="checkbox" name="functional">
                            功能性 Cookie
                        </label>
                        <p>这些 Cookie 使网站能够记住您的选择，提供增强的个性化功能。</p>
                    </div>
                </div>
                <div class="cookie-modal-buttons">
                    <button class="cookie-btn save-preferences">保存设置</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.save-preferences').addEventListener('click', () => {
            this.savePreferences(modal);
            modal.remove();
        });
    }

    // 保存用户偏好设置
    savePreferences(modal) {
        const preferences = {
            necessary: true,
            performance: modal.querySelector('input[name="performance"]').checked,
            functional: modal.querySelector('input[name="functional"]').checked,
            timestamp: new Date().toISOString()
        };
        this.saveCookieConsent(preferences);
        this.applyPreferences(preferences);
    }

    // 接受所有 Cookie
    acceptAll() {
        const preferences = {
            necessary: true,
            performance: true,
            functional: true,
            timestamp: new Date().toISOString()
        };
        this.saveCookieConsent(preferences);
        this.applyPreferences(preferences);
    }

    // 仅接受必要的 Cookie
    acceptNecessary() {
        const preferences = {
            necessary: true,
            performance: false,
            functional: false,
            timestamp: new Date().toISOString()
        };
        this.saveCookieConsent(preferences);
        this.applyPreferences(preferences);
    }

    // 应用 Cookie 偏好设置
    applyPreferences(preferences) {
        // 必要的 Cookie 总是启用
        if (!preferences.performance) {
            // 禁用性能相关的 Cookie 和跟踪
            this.disablePerformanceCookies();
        }
        if (!preferences.functional) {
            // 禁用功能性 Cookie
            this.disableFunctionalCookies();
        }
    }

    // 禁用性能相关的 Cookie
    disablePerformanceCookies() {
        // 实现禁用性能跟踪的逻辑
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'disablePerformanceCookies'
        });
    }

    // 禁用功能性 Cookie
    disableFunctionalCookies() {
        // 实现禁用功能性 Cookie 的逻辑
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'disableFunctionalCookies'
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        // 监听 Cookie 设置按钮点击
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cookie-settings') {
                this.showCustomizeModal();
            }
        });
    }
}

// 初始化 Cookie 同意管理器
document.addEventListener('DOMContentLoaded', () => {
    window.cookieManager = new CookieConsentManager();
}); 