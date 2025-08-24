import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { PLATFORM_NAME } from '@/data/constants';

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

const PoliciesModal: React.FC<PoliciesModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTab = 'terms' 
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { t } = useTranslation('other');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {t('authModal.legalInformation')}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="terms">
              {t('authModal.termsOfService')}
            </TabsTrigger>
            <TabsTrigger value="privacy">
              {t('authModal.privacyPolicy')}
            </TabsTrigger>
            <TabsTrigger value="help">
              {t('authModal.helpCenter')}
            </TabsTrigger>
            <TabsTrigger value="contact">
              {t('authModal.contactUs')}
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <TabsContent value="terms" className="space-y-4">
              <h3 className="text-xl font-semibold">
                {t('authModal.termsOfService')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('authModal.lastUpdated')}
              </p>
              <div className="space-y-3 text-sm">
                <p>{t('authModal.legalContent.terms.welcome')}</p>
                <h4 className="font-semibold">1. Acceptance of Terms</h4>
                <p>{t('authModal.legalContent.terms.acceptance')}</p>
                <h4 className="font-semibold">2. User Accounts</h4>
                <p>{t('authModal.legalContent.terms.userAccounts')}</p>
                <h4 className="font-semibold">3. Acceptable Use</h4>
                <p>{t('authModal.legalContent.terms.acceptableUse')}</p>
                <h4 className="font-semibold">4. Intellectual Property</h4>
                <p>{t('authModal.legalContent.terms.intellectualProperty')}</p>
                <h4 className="font-semibold">5. Termination</h4>
                <p>{t('authModal.legalContent.terms.termination')}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <h3 className="text-xl font-semibold">
                {t('authModal.privacyPolicy')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('authModal.lastUpdated')}
              </p>
              <div className="space-y-3 text-sm">
                <p>{t('authModal.legalContent.privacy.description')}</p>
                <h4 className="font-semibold">1. Information We Collect</h4>
                <p>{t('authModal.legalContent.privacy.informationCollection')}</p>
                <h4 className="font-semibold">2. How We Use Your Information</h4>
                <p>{t('authModal.legalContent.privacy.informationUsage')}</p>
                <h4 className="font-semibold">3. Information Sharing</h4>
                <p>{t('authModal.legalContent.privacy.informationSharing')}</p>
                <h4 className="font-semibold">4. Data Security</h4>
                <p>{t('authModal.legalContent.privacy.dataSecurity')}</p>
                <h4 className="font-semibold">5. Your Rights</h4>
                <p>{t('authModal.legalContent.privacy.yourRights')}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="help" className="space-y-4">
              <h3 className="text-xl font-semibold">
                {t('authModal.helpCenter')}
              </h3>
              <div className="space-y-3 text-sm">
                <h4 className="font-semibold">Getting Started</h4>
                <p>{t('authModal.legalContent.help.gettingStarted')}</p>
                <h4 className="font-semibold">Creating an Account</h4>
                <p>{t('authModal.legalContent.help.creatingAccount')}</p>
                <h4 className="font-semibold">Enrolling in Courses</h4>
                <p>{t('authModal.legalContent.help.enrollingInCourses')}</p>
                <h4 className="font-semibold">Accessing Your Courses</h4>
                <p>{t('authModal.legalContent.help.accessingCourses')}</p>
                <h4 className="font-semibold">Technical Support</h4>
                <p>{t('authModal.legalContent.help.technicalSupport')}</p>
                <h4 className="font-semibold">Payment Issues</h4>
                <p>{t('authModal.legalContent.help.paymentIssues')}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-4">
              <h3 className="text-xl font-semibold">
                {t('authModal.contactUs')}
              </h3>
              <div className="space-y-3 text-sm">
                <p>{t('authModal.legalContent.contact.description')}</p>
                <h4 className="font-semibold">
                  {t('authModal.legalContent.contact.emailSupport')}
                </h4>
                <p>
                  {t('authModal.legalContent.contact.generalInquiries')}: 
                  <a 
                    href={`mailto:support@${PLATFORM_NAME.toLowerCase()}.com`} 
                    className="text-primary hover:underline ml-1"
                  >
                    support@{PLATFORM_NAME.toLowerCase()}.com
                  </a>
                </p>
                <p>
                  {t('authModal.legalContent.contact.technicalSupport')}: 
                  <a 
                    href={`mailto:tech@${PLATFORM_NAME.toLowerCase()}.com`} 
                    className="text-primary hover:underline ml-1"
                  >
                    tech@{PLATFORM_NAME.toLowerCase()}.com
                  </a>
                </p>
                <h4 className="font-semibold">
                  {t('authModal.legalContent.contact.phoneSupport')}
                </h4>
                <p>{t('authModal.legalContent.contact.businessHours')}</p>
                <p>{t('authModal.legalContent.contact.phoneNumber')}</p>
                <h4 className="font-semibold">
                  {t('authModal.legalContent.contact.liveChat')}
                </h4>
                <p>{t('authModal.legalContent.contact.liveChatDescription')}</p>
                <h4 className="font-semibold">
                  {t('authModal.legalContent.contact.responseTime')}
                </h4>
                <p>{t('authModal.legalContent.contact.responseTimeDescription')}</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PoliciesModal;
