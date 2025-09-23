import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Edit, Calendar, BookOpen, Globe, Save, X, CreditCard, Phone, Building2, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo';
import { PaymentData } from '@/types/payment';

interface Teacher {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  specialization: string | null;
  experience_years: number | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  website_url: string | null;
  social_links: any;
  is_active: boolean;
  course_count?: number;
  payment_data?: PaymentData;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  price: number;
  category: string | null;
  created_at: string;
}

export const TeacherProfile = () => {
  const { teacherSlug } = useParams<{ teacherSlug: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const { t } = useTranslation('dashboard');
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Teacher>>({});
  const [courseEnrollmentMap, setCourseEnrollmentMap] = useState<{ [courseId: string]: boolean }>({});
  const [courseCounts, setCourseCounts] = useState<{ [courseId: string]: number }>({});
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({});

  const isOwner = user && teacher && user.id === teacher.user_id;

  useEffect(() => {
    if (teacherSlug) {
      fetchTeacherProfile();
    }
  }, [teacherSlug]);

  useEffect(() => {
    if (courses.length > 0 && user) {
      fetchCourseEnrollmentsAndCounts();
    }
    // eslint-disable-next-line
  }, [courses, user]);

  const fetchCourseEnrollmentsAndCounts = async () => {
    const courseIds = courses.map(c => c.id);
    // Fetch enrollments for this user for these courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user.id)
      .in('course_id', courseIds);

    const enrolledMap: { [courseId: string]: boolean } = {};
    (enrollments || []).forEach(e => {
      enrolledMap[e.course_id] = true;
    });

    // Fetch enrollment counts for each course
    const counts: { [courseId: string]: number } = {};
    await Promise.all(courseIds.map(async (id) => {
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', id);
      counts[id] = count || 0;
    }));

    setCourseEnrollmentMap(enrolledMap);
    setCourseCounts(counts);
  };

  const fetchTeacherProfile = async () => {
    try {
      // Fetch teacher profile
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('slug', teacherSlug)
        .eq('is_active', true)
        .single();

      if (teacherError) {
        toast.error('Teacher not found');
        navigate('/teachers');
        return;
      }

      // Fetch teacher's courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', teacherData.user_id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
      }

      setTeacher({ ...teacherData, course_count: coursesData?.length || 0 });
      setCourses(coursesData || []);
      
      // Initialize payment data if user is the owner
      if (user && user.id === teacherData.user_id) {
        setPaymentData(teacherData.payment_data || {});
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      toast.error('Failed to load teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditData({
      display_name: teacher?.display_name || '',
      bio: teacher?.bio || '',
      specialization: teacher?.specialization || '',
      experience_years: teacher?.experience_years || 0,
      website_url: teacher?.website_url || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!teacher) return;

    try {
      const { error } = await supabase
        .from('teachers')
        .update(editData)
        .eq('id', teacher.id);

      if (error) {
        toast.error('Failed to update profile');
        return;
      }

      setTeacher({ ...teacher, ...editData });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleEditPayment = () => {
    setIsEditingPayment(true);
  };

  const handleSavePayment = async () => {
    if (!teacher) return;

    try {
      const { error } = await supabase
        .from('teachers')
        .update({ payment_data: paymentData })
        .eq('id', teacher.id);

      if (error) {
        toast.error('Failed to update payment data');
        return;
      }

      setTeacher({ ...teacher, payment_data: paymentData });
      setIsEditingPayment(false);
      toast.success('Payment data updated successfully');
    } catch (error) {
      console.error('Error updating payment data:', error);
      toast.error('Failed to update payment data');
    }
  };

  const handleCancelPayment = () => {
    setIsEditingPayment(false);
    // Reset payment data to original values
    setPaymentData(teacher?.payment_data || {});
  };

  const updatePaymentData = (key: keyof PaymentData, field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg mb-8"></div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="h-40 bg-muted rounded-lg mb-4"></div>
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('teacherProfile.teacherNotFound')}</h1>
          <Button onClick={() => navigate('/teachers')}>
            {t('teacherProfile.backToTeachers')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        contentTitle={teacher?.display_name || 'Teacher Profile'}
        contentDescription={teacher?.bio || `Learn more about ${teacher?.display_name || 'this expert teacher'} and explore their courses and expertise.`}
      />
      <div className="min-h-screen bg-background">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-primary to-primary-400 overflow-hidden">
        {teacher.cover_image_url && (
          <img
            src={teacher.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Profile Header */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-end gap-6">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={teacher.profile_image_url || undefined} />
              <AvatarFallback className="text-3xl">
                {teacher.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-white">
              <div className="flex items-center justify-between">
                <div>
                  {isEditing ? (
                    <Input
                      value={editData.display_name || ''}
                      onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                      className="text-2xl font-bold bg-white/20 border-white/30 text-white placeholder:text-white/70"
                      placeholder={t('teacherProfile.displayName')}
                    />
                  ) : (
                    <h1 className="text-3xl font-bold">{teacher.display_name}</h1>
                  )}
                  
                  {teacher.specialization && (
                    <div className="mt-2">
                      {isEditing ? (
                        <Input
                          value={editData.specialization || ''}
                          onChange={(e) => setEditData({ ...editData, specialization: e.target.value })}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                          placeholder={t('teacherProfile.specialization')}
                        />
                      ) : (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {teacher.specialization}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {isOwner && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Save className="w-4 h-4 mr-2" />
                          {t('teacherProfile.saveChanges')}
                        </Button>
                        <Button onClick={handleCancel} size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20">
                          <X className="w-4 h-4 mr-2" />
                          {t('teacherProfile.cancel')}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleEdit} size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20">
                        <Edit className="w-4 h-4 mr-2" />
                        {t('teacherProfile.editProfile')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>{t('teacherProfile.about')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editData.bio || ''}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder={t('teacherProfile.tellUsAboutYourself')}
                    className="min-h-[120px]"
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {teacher.bio || t('teacherProfile.noBio')}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Courses */}
            <Card>
              <CardHeader>
                <CardTitle>{t('teacherProfile.courses')} ({courses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <p className="text-muted-foreground">{t('teacherProfile.noCourses')}</p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {courses.map((course) => (
                      <PremiumCourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        description={course.description || ''}
                        category={course.category || ''}
                        status={"published"}
                        instructor_name={teacher.display_name}
                        enrollment_count={courseCounts[course.id] || 0}
                        is_enrolled={!!courseEnrollmentMap[course.id]}
                        enrollment_code={''}
                        cover_image_url={course.cover_image_url || undefined}
                        created_at={course.created_at}
                        price={course.price}
                        onPreview={() => navigate(`/courses/${course.id}`)}
                        onEnroll={() => navigate(`/courses/${course.id}`)}
                        onContinue={() => navigate(`/courses/${course.id}`)}
                        avatar_url={teacher.profile_image_url}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>{t('teacherProfile.stats')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">{teacher.course_count || 0}</p>
                    <p className="text-sm text-muted-foreground">{t('teacherProfile.courses')}</p>
                  </div>
                </div>
                
                {teacher.experience_years && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData.experience_years || ''}
                          onChange={(e) => setEditData({ ...editData, experience_years: parseInt(e.target.value) || 0 })}
                          placeholder={t('teacherProfile.yearsOfExperience')}
                          className="w-full"
                        />
                      ) : (
                        <>
                          <p className="font-semibold">{teacher.experience_years}+ {t('teacherProfile.years')}</p>
                          <p className="text-sm text-muted-foreground">{t('teacherProfile.experience')}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Links */}
            {(teacher.website_url || isEditing) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('teacherProfile.links')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Input
                      value={editData.website_url || ''}
                      onChange={(e) => setEditData({ ...editData, website_url: e.target.value })}
                      placeholder={t('teacherProfile.websiteUrl')}
                    />
                  ) : (
                    teacher.website_url && (
                      <a
                        href={teacher.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Globe className="w-4 h-4" />
                        {t('teacherProfile.website')}
                      </a>
                    )
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Data - Only visible to the teacher owner */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </CardTitle>
                    {!isEditingPayment && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditPayment}
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingPayment ? (
                    <div className="space-y-4">
                      {/* Vodafone Cash */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Vodafone Cash
                        </label>
                        <Input
                          placeholder="Phone number (e.g., 01234567890)"
                          value={paymentData.vodafone_cash?.phone_number || ''}
                          onChange={(e) => updatePaymentData('vodafone_cash', 'phone_number', e.target.value)}
                        />
                        <Input
                          placeholder="Name (optional)"
                          value={paymentData.vodafone_cash?.name || ''}
                          onChange={(e) => updatePaymentData('vodafone_cash', 'name', e.target.value)}
                        />
                      </div>

                      {/* Bank Transfer */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Banknote className="w-4 h-4" />
                          Bank Transfer
                        </label>
                        <Input
                          placeholder="Bank name (e.g., CIB)"
                          value={paymentData.bank_transfer?.bank_name || ''}
                          onChange={(e) => updatePaymentData('bank_transfer', 'bank_name', e.target.value)}
                        />
                        <Input
                          placeholder="Account number"
                          value={paymentData.bank_transfer?.account_number || ''}
                          onChange={(e) => updatePaymentData('bank_transfer', 'account_number', e.target.value)}
                        />
                        <Input
                          placeholder="Account name (optional)"
                          value={paymentData.bank_transfer?.account_name || ''}
                          onChange={(e) => updatePaymentData('bank_transfer', 'account_name', e.target.value)}
                        />
                      </div>

                      {/* Fawry */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Fawry
                        </label>
                        <Input
                          placeholder="Merchant code"
                          value={paymentData.fawry?.merchant_code || ''}
                          onChange={(e) => updatePaymentData('fawry', 'merchant_code', e.target.value)}
                        />
                        <Input
                          placeholder="Merchant name (optional)"
                          value={paymentData.fawry?.merchant_name || ''}
                          onChange={(e) => updatePaymentData('fawry', 'merchant_name', e.target.value)}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleSavePayment}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelPayment}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Display current payment data */}
                      {paymentData.vodafone_cash?.phone_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Vodafone:</span>
                          <span className="font-mono">{paymentData.vodafone_cash.phone_number}</span>
                        </div>
                      )}
                      
                      {paymentData.bank_transfer?.account_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Banknote className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Bank:</span>
                          <span className="font-mono">{paymentData.bank_transfer.bank_name} - {paymentData.bank_transfer.account_number}</span>
                        </div>
                      )}
                      
                      {paymentData.fawry?.merchant_code && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Fawry:</span>
                          <span className="font-mono">{paymentData.fawry.merchant_code}</span>
                        </div>
                      )}
                      
                      {!paymentData.vodafone_cash?.phone_number && 
                       !paymentData.bank_transfer?.account_number && 
                       !paymentData.fawry?.merchant_code && (
                        <p className="text-sm text-muted-foreground">
                          No payment information configured. Click Edit to add your payment details.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
};
