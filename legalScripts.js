/**
 * legalScripts.js
 * Separation of Concerns: This file handles ALL interactive behavior ONLY
 * Dependencies: None (vanilla JavaScript)
 * 
 * Naming Convention: camelCase for all variables/functions
 *                  snake_case for section IDs (e.g., section_1, section_2)
 */

(function() {
    'use strict';

    // ============================================
    // DOM Elements Cache - Single source of truth
    // ============================================
    const domElements = {
        lastUpdatedElements: null,
        externalLinks: null,
        smsConsentCheckboxes: null,
        termsCheckboxes: null
    };

    // ============================================
    // Configuration
    // ============================================
    const configData = {
        autoUpdateLastUpdated: false,
        trackConsentAudit: true,
        companyName: 'Ornamental Turf & Gardens'
    };

    // ============================================
    // Helper Functions
    // ============================================

    function formatDate(dateObject) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return dateObject.toLocaleDateString('en-US', options);
    }

    function setDynamicLastUpdated() {
        if (!configData.autoUpdateLastUpdated) return;
        
        const currentDate = formatDate(new Date());
        const headerElements = document.querySelectorAll('.lastUpdatedHeader');
        const footerElements = document.querySelectorAll('.complianceFooter');
        
        headerElements.forEach(header => {
            if (header.textContent.includes('Effective Date:')) {
                header.textContent = `Effective Date: ${currentDate}`;
            }
        });
        
        footerElements.forEach(footer => {
            const footerText = footer.innerHTML;
            if (footerText.includes('Effective')) {
                footer.innerHTML = footerText.replace(/\d{4}-\d{2}-\d{2}/, currentDate);
            }
        });
    }

    function secureExternalLinks() {
        const allLinks = document.querySelectorAll('a');
        const currentDomain = window.location.hostname;
        
        allLinks.forEach(link => {
            const hrefValue = link.getAttribute('href');
            if (!hrefValue) return;
            
            const isExternalLink = hrefValue.startsWith('http') && !hrefValue.includes(currentDomain);
            
            if (isExternalLink) {
                link.setAttribute('rel', 'noopener noreferrer');
                link.setAttribute('target', '_blank');
            }
        });
    }

    function logConsentInteraction(eventObject) {
        if (!configData.trackConsentAudit) return;
        
        const checkboxElement = eventObject.target;
        const checkboxId = checkboxElement.id;
        const isChecked = checkboxElement.checked;
        const timestamp = new Date().toISOString();
        
        let checkboxType = 'unknown';
        if (checkboxId.includes('sms') || (checkboxElement.parentElement && checkboxElement.parentElement.textContent.includes('SMS'))) {
            checkboxType = 'SMS Consent';
        } else if (checkboxId.includes('terms') || checkboxElement.parentElement.textContent.includes('Terms')) {
            checkboxType = 'Terms & Privacy';
        }
        
        console.info(`[A2P Compliance Audit] ${timestamp} - ${configData.companyName} - ${checkboxType} ${isChecked ? 'GRANTED' : 'REVOKED'} - Element ID: ${checkboxId || 'no-id'}`);
    }

    function attachConsentTracking() {
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        
        allCheckboxes.forEach(checkbox => {
            const surroundingText = checkbox.parentElement ? checkbox.parentElement.textContent.toLowerCase() : '';
            
            if (surroundingText.includes('sms') || 
                surroundingText.includes('text message') ||
                surroundingText.includes('consent to receive') ||
                checkbox.id.toLowerCase().includes('sms') ||
                checkbox.id.toLowerCase().includes('consent')) {
                
                checkbox.addEventListener('change', logConsentInteraction);
                domElements.smsConsentCheckboxes = domElements.smsConsentCheckboxes || [];
                domElements.smsConsentCheckboxes.push(checkbox);
            }
            
            if (surroundingText.includes('terms') || 
                surroundingText.includes('privacy') ||
                checkbox.id.toLowerCase().includes('terms') ||
                checkbox.id.toLowerCase().includes('privacy')) {
                
                checkbox.addEventListener('change', logConsentInteraction);
                domElements.termsCheckboxes = domElements.termsCheckboxes || [];
                domElements.termsCheckboxes.push(checkbox);
            }
        });
    }

    // ============================================
    // Sticky Navigation & Active Section Highlighting
    // ============================================

    const stickyNavElement = document.getElementById('stickyNav');
    const headerElement = document.querySelector('.legalHeader');
    const sectionElements = document.querySelectorAll('.legalContent section');
    const navLinkElements = document.querySelectorAll('.sectionLinks a');
    
    let headerBottomPosition = 0;
    
    function updateHeaderBottom() {
        if (headerElement) {
            headerBottomPosition = headerElement.offsetTop + headerElement.offsetHeight;
        }
    }
    
    function handleStickyNav() {
        if (!stickyNavElement) return;
        
        const scrollYposition = window.scrollY;
        
        if (scrollYposition > headerBottomPosition) {
            stickyNavElement.classList.add('sticky');
        } else {
            stickyNavElement.classList.remove('sticky');
        }
    }
    
    function highlightActiveSection() {
        const scrollPosition = window.scrollY + 150;
        
        let currentSectionId = '';
        
        sectionElements.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinkElements.forEach(link => {
            link.classList.remove('active');
            const hrefValue = link.getAttribute('href');
            if (hrefValue && hrefValue.substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
    }
    
    function initSmoothScroll() {
        navLinkElements.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (!targetId || targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const stickyHeight = stickyNavElement && stickyNavElement.classList.contains('sticky') ? stickyNavElement.offsetHeight : 0;
                    const offsetAmount = stickyHeight + 20;
                    
                    const elementPosition = targetElement.offsetTop;
                    const offsetPosition = elementPosition - offsetAmount;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    function addSectionIds() {
        const sectionHeadings = document.querySelectorAll('.legalContent h2');
        const sectionNumberMap = {
            '1. Information We Collect': 'section_1',
            '2. How We Use Your Information': 'section_2',
            '3. SMS Messaging & A2P 10DLC Compliance': 'section_3',
            '4. Information Sharing & Disclosure': 'section_4',
            '5. Data Security': 'section_5',
            '6. Your Rights & Choices': 'section_6',
            '7. Children\'s Privacy': 'section_7',
            '8. Changes to This Privacy Policy': 'section_8',
            '9. Contact Us': 'section_9'
        };
        
        sectionHeadings.forEach(heading => {
            const headingText = heading.textContent.trim();
            const parentSection = heading.closest('section');
            if (parentSection && !parentSection.getAttribute('id')) {
                const mappedId = sectionNumberMap[headingText];
                if (mappedId) {
                    parentSection.setAttribute('id', mappedId);
                } else {
                    const fallbackId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    parentSection.setAttribute('id', fallbackId);
                }
            }
        });
    }
    
    let scrollTicking = false;
    function onScrollHandler() {
        if (!scrollTicking) {
            requestAnimationFrame(function() {
                handleStickyNav();
                highlightActiveSection();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }
    
    function initStickyNav() {
        addSectionIds();
        updateHeaderBottom();
        handleStickyNav();
        initSmoothScroll();
        
        window.addEventListener('scroll', onScrollHandler);
        window.addEventListener('resize', function() {
            updateHeaderBottom();
            handleStickyNav();
        });
    }

    // ============================================
    // Additional Smooth Scroll (for any anchor links)
    // ============================================

    function enableSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    event.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ============================================
    // A2P Compliance Validation
    // ============================================

    function validateA2pCompliance() {
        const complianceResults = {
            hasPrivacyPolicy: false,
            hasTermsOfService: false,
            hasSmsDisclosure: false,
            hasOptOutInstructions: false,
            hasHelpInstructions: false,
            hasDataRateDisclosure: false
        };
        
        if (document.body.textContent.includes('Privacy Policy')) {
            complianceResults.hasPrivacyPolicy = true;
        }
        
        if (document.body.textContent.includes('Terms of Service') || 
            document.body.textContent.includes('Terms and Conditions')) {
            complianceResults.hasTermsOfService = true;
        }
        
        if (document.body.textContent.includes('SMS') || 
            document.body.textContent.includes('text message')) {
            complianceResults.hasSmsDisclosure = true;
        }
        
        if (document.body.textContent.includes('STOP')) {
            complianceResults.hasOptOutInstructions = true;
        }
        
        if (document.body.textContent.includes('HELP')) {
            complianceResults.hasHelpInstructions = true;
        }
        
        if (document.body.textContent.includes('message and data rates may apply')) {
            complianceResults.hasDataRateDisclosure = true;
        }
        
        console.info('[A2P Compliance Check]', complianceResults);
        
        return complianceResults;
    }

    // ============================================
    // Main Initialization
    // ============================================

    function initializeAll() {
        setDynamicLastUpdated();
        secureExternalLinks();
        enableSmoothScroll();
        attachConsentTracking();
        validateA2pCompliance();
        initStickyNav();
        
        const domObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    attachConsentTracking();
                }
            });
        });
        
        domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.info(`[${configData.companyName}] Legal pages initialized with proper separation of concerns.`);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAll);
    } else {
        initializeAll();
    }
})();