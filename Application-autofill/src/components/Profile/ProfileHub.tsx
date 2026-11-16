import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Link2,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Star,
  Eye,
  Download,
  Check,
  Edit3,
  FileUp,
  X,
  Globe,
  ExternalLink,
  Copy,
  Code2,
  Share2,
  HelpCircle,
  Search,
  MessageSquare
} from 'lucide-react';
import { UserProfile, EducationRecord, ExperienceRecord, SkillItem, ResumeFile, LinkRecord, CustomQuestionAnswer } from '../../types';

interface ProfileHubProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

export const ProfileHub: React.FC<ProfileHubProps> = ({
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [activeSection, setActiveSection] = useState<'personal' | 'professional' | 'education' | 'experience' | 'skills' | 'links' | 'resumes' | 'other'>('personal');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Custom Q&A section state
  const [isAddingQnA, setIsAddingQnA] = useState<boolean>(false);
  const [newQnAQuestion, setNewQnAQuestion] = useState<string>('');
  const [newQnAAnswer, setNewQnAAnswer] = useState<string>('');
  const [newQnACategory, setNewQnACategory] = useState<string>('General');
  const [editingQnAId, setEditingQnAId] = useState<string | null>(null);
  const [editQnAQuestion, setEditQnAQuestion] = useState<string>('');
  const [editQnAAnswer, setEditQnAAnswer] = useState<string>('');
  const [editQnACategory, setEditQnACategory] = useState<string>('General');
  const [qnaSearchQuery, setQnaSearchQuery] = useState<string>('');
  const [qnaCategoryFilter, setQnaCategoryFilter] = useState<string>('All');
  const [copiedQnAId, setCopiedQnAId] = useState<string | null>(null);

  const QUESTION_SUGGESTIONS = [
    {
      question: 'Why are you interested in joining our company?',
      category: 'Behavioral',
      defaultAnswer: 'I am excited by your engineering mission, modern stack, and collaborative developer culture. My background in building responsive web applications and scalable APIs directly aligns with your roadmap.',
    },
    {
      question: 'What is your target compensation or salary expectation?',
      category: 'Logistics',
      defaultAnswer: '$160,000 - $185,000 base salary plus equity, open to discussion based on comprehensive benefits.',
    },
    {
      question: 'What is your earliest available start date or notice period?',
      category: 'Logistics',
      defaultAnswer: '2 weeks from offer acceptance.',
    },
    {
      question: 'Are you open to hybrid work or relocation?',
      category: 'Logistics',
      defaultAnswer: 'Yes, fully equipped for productive remote work and open to hybrid in-office collaboration.',
    },
    {
      question: 'Describe your proudest technical achievement or project.',
      category: 'Technical',
      defaultAnswer: 'Architected an asynchronous event pipeline that reduced p99 query latency by 40% while lowering infrastructure compute costs.',
    },
    {
      question: 'Are you bound by any non-compete or restrictive agreements?',
      category: 'Authorization',
      defaultAnswer: 'No, I have no restrictive covenants or active non-compete agreements.',
    },
    {
      question: 'How did you hear about this opportunity?',
      category: 'General',
      defaultAnswer: 'Company careers portal & LinkedIn.',
    },
    {
      question: 'What are your preferred pronouns?',
      category: 'General',
      defaultAnswer: 'He / Him (or They / Them)',
    },
  ];

  const handleAddQnA = () => {
    if (!newQnAQuestion.trim() || !newQnAAnswer.trim()) return;

    const newQnA: CustomQuestionAnswer = {
      id: `qna-${Date.now()}`,
      question: newQnAQuestion.trim(),
      answer: newQnAAnswer.trim(),
      category: newQnACategory || 'General',
    };

    const currentQuestions = formData.otherQuestions || [];
    const updatedQuestions = [...currentQuestions, newQnA];
    const updatedProfile: UserProfile = {
      ...formData,
      otherQuestions: updatedQuestions,
    };

    setFormData(updatedProfile);
    onSaveProfile(updatedProfile);

    setNewQnAQuestion('');
    setNewQnAAnswer('');
    setIsAddingQnA(false);
    setSaveStatus('Custom Question & Answer saved to profile storage.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleApplySuggestion = (s: typeof QUESTION_SUGGESTIONS[0]) => {
    setIsAddingQnA(true);
    setNewQnAQuestion(s.question);
    setNewQnACategory(s.category);
    setNewQnAAnswer(s.defaultAnswer);
  };

  const handleDeleteQnA = (id: string) => {
    const currentQuestions = formData.otherQuestions || [];
    const target = currentQuestions.find((q) => q.id === id);
    const updatedQuestions = currentQuestions.filter((q) => q.id !== id);

    const updatedProfile: UserProfile = {
      ...formData,
      otherQuestions: updatedQuestions,
    };

    setFormData(updatedProfile);
    onSaveProfile(updatedProfile);

    if (editingQnAId === id) setEditingQnAId(null);
    setSaveStatus(`Removed question "${target?.question ? target.question.slice(0, 30) + '...' : 'question'}".`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleStartEditQnA = (qna: CustomQuestionAnswer) => {
    setEditingQnAId(qna.id);
    setEditQnAQuestion(qna.question);
    setEditQnAAnswer(qna.answer);
    setEditQnACategory(qna.category || 'General');
  };

  const handleSaveEditQnA = (id: string) => {
    if (!editQnAQuestion.trim() || !editQnAAnswer.trim()) return;

    const currentQuestions = formData.otherQuestions || [];
    const updatedQuestions = currentQuestions.map((q) =>
      q.id === id
        ? { ...q, question: editQnAQuestion.trim(), answer: editQnAAnswer.trim(), category: editQnACategory }
        : q
    );

    const updatedProfile: UserProfile = {
      ...formData,
      otherQuestions: updatedQuestions,
    };

    setFormData(updatedProfile);
    onSaveProfile(updatedProfile);

    setEditingQnAId(null);
    setSaveStatus('Question & Answer updated and saved.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleCopyQnAAnswer = (id: string, answer: string) => {
    navigator.clipboard.writeText(answer);
    setCopiedQnAId(id);
    setTimeout(() => setCopiedQnAId(null), 2000);
  };

  // Resume management state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingResume, setIsDraggingResume] = useState<boolean>(false);
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState<string>('');
  const [editingContentResumeId, setEditingContentResumeId] = useState<string | null>(null);
  const [editContentValue, setEditContentValue] = useState<string>('');

  // Links management state
  const [isAddingLink, setIsAddingLink] = useState<boolean>(false);
  const [newLinkCategory, setNewLinkCategory] = useState<string>('linkedin');
  const [newLinkLabel, setNewLinkLabel] = useState<string>('');
  const [newLinkUrl, setNewLinkUrl] = useState<string>('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [editingLinkLabelId, setEditingLinkLabelId] = useState<string | null>(null);
  const [editLinkLabelValue, setEditLinkLabelValue] = useState<string>('');

  const LINK_PRESETS = [
    { category: 'linkedin', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/username', defaultUrl: 'https://linkedin.com/in/' },
    { category: 'github', label: 'GitHub Profile', placeholder: 'https://github.com/username', defaultUrl: 'https://github.com/' },
    { category: 'portfolio', label: 'Portfolio Website', placeholder: 'https://myportfolio.dev', defaultUrl: 'https://' },
    { category: 'website', label: 'Personal Website', placeholder: 'https://alexmorgan.dev', defaultUrl: 'https://' },
    { category: 'twitter', label: 'Twitter / X Profile', placeholder: 'https://x.com/username', defaultUrl: 'https://x.com/' },
    { category: 'blog', label: 'Tech Blog / Substack', placeholder: 'https://username.substack.com', defaultUrl: 'https://' },
    { category: 'stackoverflow', label: 'StackOverflow Profile', placeholder: 'https://stackoverflow.com/users/...', defaultUrl: 'https://stackoverflow.com/users/' },
    { category: 'dribbble', label: 'Dribbble / Behance', placeholder: 'https://dribbble.com/username', defaultUrl: 'https://dribbble.com/' },
    { category: 'kaggle', label: 'Kaggle Profile', placeholder: 'https://kaggle.com/username', defaultUrl: 'https://kaggle.com/' },
    { category: 'custom', label: 'Custom Link', placeholder: 'https://...', defaultUrl: 'https://' },
  ];

  const getNormalizedLinks = (links: typeof formData.links): LinkRecord[] => {
    if (links.customLinks && links.customLinks.length > 0) {
      return links.customLinks;
    }
    const records: LinkRecord[] = [];
    if (links.linkedinUrl) {
      records.push({ id: 'link-linkedin', label: 'LinkedIn Profile', url: links.linkedinUrl, category: 'linkedin' });
    }
    if (links.githubUrl) {
      records.push({ id: 'link-github', label: 'GitHub Profile', url: links.githubUrl, category: 'github' });
    }
    if (links.portfolioUrl) {
      records.push({ id: 'link-portfolio', label: 'Portfolio Website', url: links.portfolioUrl, category: 'portfolio' });
    }
    if (links.personalWebsite) {
      records.push({ id: 'link-website', label: 'Personal Website', url: links.personalWebsite, category: 'website' });
    }
    if (links.twitterUrl) {
      records.push({ id: 'link-twitter', label: 'Twitter / X Profile', url: links.twitterUrl, category: 'twitter' });
    }
    if (links.blogUrl) {
      records.push({ id: 'link-blog', label: 'Tech Blog / Substack', url: links.blogUrl, category: 'blog' });
    }
    return records;
  };

  const syncLinks = (newLinkRecords: LinkRecord[]) => {
    const linkedin = newLinkRecords.find((l) => l.category === 'linkedin')?.url || '';
    const github = newLinkRecords.find((l) => l.category === 'github')?.url || '';
    const portfolio = newLinkRecords.find((l) => l.category === 'portfolio')?.url || '';
    const website = newLinkRecords.find((l) => l.category === 'website')?.url || '';
    const twitter = newLinkRecords.find((l) => l.category === 'twitter')?.url || '';
    const blog = newLinkRecords.find((l) => l.category === 'blog')?.url || '';

    const updatedProfile: UserProfile = {
      ...formData,
      links: {
        ...formData.links,
        linkedinUrl: linkedin,
        githubUrl: github,
        portfolioUrl: portfolio,
        personalWebsite: website,
        twitterUrl: twitter,
        blogUrl: blog,
        customLinks: newLinkRecords,
      },
    };

    setFormData(updatedProfile);
    onSaveProfile(updatedProfile);
  };

  const handleUpdateLink = (id: string, field: 'label' | 'url', value: string) => {
    const currentList = getNormalizedLinks(formData.links);
    const updated = currentList.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    syncLinks(updated);
  };

  const handleDeleteLink = (id: string) => {
    const currentList = getNormalizedLinks(formData.links);
    const target = currentList.find((l) => l.id === id);
    const updated = currentList.filter((item) => item.id !== id);
    syncLinks(updated);
    setSaveStatus(`Removed link "${target?.label || 'Link'}". Saved to storage.`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    const currentList = getNormalizedLinks(formData.links);
    const preset = LINK_PRESETS.find((p) => p.category === newLinkCategory);
    const label = newLinkLabel.trim() || preset?.label || 'Professional Link';

    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith('mailto:')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newRecord: LinkRecord = {
      id: `link-${Date.now()}`,
      label,
      url: formattedUrl,
      category: newLinkCategory,
    };

    const updated = [...currentList, newRecord];
    syncLinks(updated);

    setNewLinkUrl('');
    setNewLinkLabel('');
    setIsAddingLink(false);
    setSaveStatus(`Added "${label}". Saved to storage.`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleQuickAddPreset = (category: string, defaultLabel: string, defaultUrl: string) => {
    const currentList = getNormalizedLinks(formData.links);
    const existing = currentList.find((l) => l.category === category);
    if (existing) {
      setSaveStatus(`"${defaultLabel}" is already in your links.`);
      setTimeout(() => setSaveStatus(null), 2500);
      return;
    }
    const newRecord: LinkRecord = {
      id: `link-${Date.now()}`,
      label: defaultLabel,
      url: defaultUrl,
      category,
    };
    const updated = [...currentList, newRecord];
    syncLinks(updated);
    setSaveStatus(`Added ${defaultLabel}. You can now customize the URL.`);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleCopyLink = (id: string, url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const renderLinkIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'linkedin':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'github':
        return <Code2 className="w-4 h-4 text-purple-400" />;
      case 'portfolio':
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'website':
      case 'blog':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'twitter':
        return <Share2 className="w-4 h-4 text-sky-400" />;
      case 'stackoverflow':
        return <Code2 className="w-4 h-4 text-amber-400" />;
      case 'dribbble':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      default:
        return <Link2 className="w-4 h-4 text-indigo-400" />;
    }
  };

  // Keep local form in sync if external profile updates
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handlePersonalChange = (key: keyof typeof formData.personal, val: string) => {
    setFormData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [key]: val },
    }));
  };

  const handleProfessionalChange = (key: keyof typeof formData.professional, val: any) => {
    setFormData((prev) => ({
      ...prev,
      professional: { ...prev.professional, [key]: val },
    }));
  };

  const handleLinkChange = (key: keyof typeof formData.links, val: string) => {
    setFormData((prev) => ({
      ...prev,
      links: { ...prev.links, [key]: val },
    }));
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu: EducationRecord = {
      id: `edu-${Date.now()}`,
      degree: 'Master of Science',
      institution: 'Stanford University',
      fieldOfStudy: 'Computer Science',
      startDate: '2020',
      endDate: '2022',
      gradeGpa: '3.9',
    };
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const handleUpdateEducation = (id: string, key: keyof EducationRecord, val: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [key]: val } : e)),
    }));
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp: ExperienceRecord = {
      id: `exp-${Date.now()}`,
      company: 'Tech Enterprise Co.',
      title: 'Senior Engineer',
      location: 'Remote',
      startDate: '2022-01',
      endDate: 'Present',
      current: true,
      responsibilities: 'Built scalable cloud backends, managed distributed systems, and led technical design.',
    };
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  const handleUpdateExperience = (id: string, key: keyof ExperienceRecord, val: any) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [key]: val } : e)),
    }));
  };

  // Skill handlers
  const handleAddSkill = () => {
    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      name: 'Kubernetes',
      level: 'Advanced',
      category: 'DevOps',
    };
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  };

  const handleRemoveSkill = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  // Resume helper & management handlers
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleUploadResumeFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newResumePromises = fileArray.map((file) => {
      return new Promise<ResumeFile>((resolve) => {
        const reader = new FileReader();
        const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md');

        reader.onload = () => {
          const result = reader.result;
          let textSnippet = '';
          let dataUrl: string | undefined = undefined;

          if (typeof result === 'string') {
            if (isText) {
              textSnippet = result.slice(0, 4000);
            } else {
              dataUrl = result;
              textSnippet = `${file.name} - Uploaded resume document (${formatFileSize(file.size)}). Ready for 1-click application attachment.`;
            }
          }

          resolve({
            id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            uploadedAt: new Date().toISOString(),
            isDefault: false,
            textContent: textSnippet || `${file.name} resume attachment.`,
            fileData: dataUrl,
          });
        };

        reader.onerror = () => {
          resolve({
            id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            uploadedAt: new Date().toISOString(),
            isDefault: false,
            textContent: `${file.name} resume document.`,
          });
        };

        if (isText) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });
    });

    const newResumes = await Promise.all(newResumePromises);

    const hasDefault = formData.resumes.some((r) => r.isDefault);
    // If no resume is currently default, designate the first newly uploaded file as default
    const adjustedNewResumes = newResumes.map((res, index) => ({
      ...res,
      isDefault: !hasDefault && index === 0,
    }));

    const updatedResumes = [...formData.resumes, ...adjustedNewResumes];
    const updatedProfile = { ...formData, resumes: updatedResumes };

    setFormData(updatedProfile);
    onSaveProfile(updatedProfile);

    setSaveStatus(`Uploaded ${newResumes.length} resume(s) successfully! Saved to storage.`);
    setTimeout(() => setSaveStatus(null), 3500);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSetDefaultResume = (id: string) => {
    const target = formData.resumes.find((r) => r.id === id);
    if (!target) return;

    const updatedResumes = formData.resumes.map((r) => ({
      ...r,
      isDefault: r.id === id,
    }));
    const updatedProfile = { ...formData, resumes: updatedResumes };

    setFormData(updatedProfile);
    onSaveProfile(updatedProfile);

    setSaveStatus(`"${target.fileName}" is now set as your primary default resume.`);
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleDeleteResume = (id: string) => {
    const target = formData.resumes.find((r) => r.id === id);
    if (!target) return;

    let updatedResumes = formData.resumes.filter((r) => r.id !== id);
    // If the deleted resume was default and there are remaining resumes, make the first one default
    if (target.isDefault && updatedResumes.length > 0) {
      updatedResumes = updatedResumes.map((r, i) => ({
        ...r,
        isDefault: i === 0,
      }));
    }
    const updatedProfile = { ...formData, resumes: updatedResumes };

    setFormData(updatedProfile);
    onSaveProfile(updatedProfile);

    if (previewResumeId === id) setPreviewResumeId(null);
    if (editingResumeId === id) setEditingResumeId(null);
    if (editingContentResumeId === id) setEditingContentResumeId(null);

    setSaveStatus(`Resume "${target.fileName}" has been deleted.`);
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleDownloadResume = (res: ResumeFile) => {
    if (res.fileData) {
      const a = document.createElement('a');
      a.href = res.fileData;
      a.download = res.fileName;
      a.click();
    } else {
      const blob = new Blob([res.textContent || res.fileName], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.fileName.endsWith('.txt') ? res.fileName : `${res.fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleStartEditTitle = (res: ResumeFile) => {
    setEditingResumeId(res.id);
    setEditTitleValue(res.title || res.fileName);
  };

  const handleSaveEditTitle = (id: string) => {
    if (!editTitleValue.trim()) {
      setEditingResumeId(null);
      return;
    }
    const updatedResumes = formData.resumes.map((r) =>
      r.id === id ? { ...r, title: editTitleValue.trim() } : r
    );
    const updatedProfile = { ...formData, resumes: updatedResumes };

    setFormData(updatedProfile);
    onSaveProfile(updatedProfile);
    setEditingResumeId(null);
  };

  const handleStartEditContent = (res: ResumeFile) => {
    setEditingContentResumeId(res.id);
    setEditContentValue(res.textContent || '');
  };

  const handleSaveEditContent = (id: string) => {
    const updatedResumes = formData.resumes.map((r) =>
      r.id === id ? { ...r, textContent: editContentValue } : r
    );
    const updatedProfile = { ...formData, resumes: updatedResumes };

    setFormData(updatedProfile);
    onSaveProfile(updatedProfile);
    setEditingContentResumeId(null);
    setSaveStatus('Resume text content updated.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Save logic
  const handleSave = () => {
    onSaveProfile(formData);
    setSaveStatus('Profile saved successfully! Ready for autofill.');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Candidate Profile & Documents Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter your master credentials once. The Chrome autofill extension matches this verified data to job application forms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Grid: Sidebar Nav + Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 h-fit space-y-1">
          <button
            onClick={() => setActiveSection('personal')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
              activeSection === 'personal'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal Information</span>
          </button>

          <button
            onClick={() => setActiveSection('professional')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
              activeSection === 'professional'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Professional Profile</span>
          </button>

          <button
            onClick={() => setActiveSection('education')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
              activeSection === 'education'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education ({formData.education.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('experience')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
              activeSection === 'experience'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Experience ({formData.experience.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('skills')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
              activeSection === 'skills'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skills Inventory ({formData.skills.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('links')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
              activeSection === 'links'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Professional Links ({getNormalizedLinks(formData.links).length})</span>
          </button>

          <button
            onClick={() => setActiveSection('resumes')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
              activeSection === 'resumes'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resumes & CVs ({formData.resumes.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('other')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
              activeSection === 'other'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Other / Custom Q&A ({(formData.otherQuestions || []).length})</span>
          </button>
        </div>

        {/* Section Forms */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {/* FR-01: Personal Information */}
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Personal Information (FR-01)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.personal.firstName}
                    onChange={(e) => handlePersonalChange('firstName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.personal.lastName}
                    onChange={(e) => handlePersonalChange('lastName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.personal.email}
                    onChange={(e) => handlePersonalChange('email', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.personal.phone}
                    onChange={(e) => handlePersonalChange('phone', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.personal.address}
                  onChange={(e) => handlePersonalChange('address', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.personal.city}
                    onChange={(e) => handlePersonalChange('city', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">State / Region</label>
                  <input
                    type="text"
                    value={formData.personal.state}
                    onChange={(e) => handlePersonalChange('state', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Postal / ZIP</label>
                  <input
                    type="text"
                    value={formData.personal.postalCode}
                    onChange={(e) => handlePersonalChange('postalCode', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FR-02: Professional Information */}
          {activeSection === 'professional' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Professional Profile & Logistics (FR-02)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Job Title</label>
                  <input
                    type="text"
                    value={formData.professional.currentTitle}
                    onChange={(e) => handleProfessionalChange('currentTitle', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Company</label>
                  <input
                    type="text"
                    value={formData.professional.currentCompany}
                    onChange={(e) => handleProfessionalChange('currentCompany', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Years of Experience</label>
                  <input
                    type="text"
                    value={formData.professional.yearsExperience}
                    onChange={(e) => handleProfessionalChange('yearsExperience', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Notice Period</label>
                  <input
                    type="text"
                    value={formData.professional.noticePeriod}
                    onChange={(e) => handleProfessionalChange('noticePeriod', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected Salary</label>
                  <input
                    type="text"
                    value={formData.professional.expectedSalary}
                    onChange={(e) => handleProfessionalChange('expectedSalary', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Work Authorization</label>
                  <input
                    type="text"
                    value={formData.professional.workAuthorization}
                    onChange={(e) => handleProfessionalChange('workAuthorization', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Require Sponsorship</label>
                  <select
                    value={formData.professional.requireSponsorship}
                    onChange={(e) => handleProfessionalChange('requireSponsorship', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Willing to Relocate</label>
                  <select
                    value={formData.professional.willingToRelocate}
                    onChange={(e) => handleProfessionalChange('willingToRelocate', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Summary / Bio</label>
                <textarea
                  rows={4}
                  value={formData.professional.professionalSummary}
                  onChange={(e) => handleProfessionalChange('professionalSummary', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* FR-03: Education History */}
          {activeSection === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Education History (FR-03)</h2>
                <button
                  onClick={handleAddEducation}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Degree</span>
                </button>
              </div>

              {formData.education.map((edu, idx) => (
                <div key={edu.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400 font-mono">
                      Degree #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleUpdateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Graduation Year</label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => handleUpdateEducation(edu.id, 'endDate', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">GPA / Grade</label>
                      <input
                        type="text"
                        value={edu.gradeGpa}
                        onChange={(e) => handleUpdateEducation(edu.id, 'gradeGpa', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FR-04: Employment History */}
          {activeSection === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Employment History (FR-04)</h2>
                <button
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              {formData.experience.map((exp, idx) => (
                <div key={exp.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400 font-mono">
                      Role #{idx + 1}: {exp.title}
                    </span>
                    <button
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleUpdateExperience(exp.id, 'title', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Key Responsibilities & Achievements</label>
                    <textarea
                      rows={3}
                      value={exp.responsibilities}
                      onChange={(e) => handleUpdateExperience(exp.id, 'responsibilities', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-xs text-slate-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FR-05: Skills Inventory */}
          {activeSection === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Skills Inventory (FR-05)</h2>
                <button
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {formData.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-100">{skill.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-indigo-400">{skill.level}</span>
                        <span>·</span>
                        <span>{skill.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FR-06: Professional Links */}
          {activeSection === 'links' && (() => {
            const currentLinks = getNormalizedLinks(formData.links);
            const presentCategories = new Set(currentLinks.map((l) => l.category.toLowerCase()));
            const availablePresets = LINK_PRESETS.filter(
              (p) => p.category !== 'custom' && !presentCategories.has(p.category.toLowerCase())
            );

            return (
              <div className="space-y-5">
                {/* Header with Title and Add Link button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-indigo-400" />
                      <span>Professional Links & Profiles (FR-06)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add, edit, or delete professional web links. The autofill extension automatically maps these links to job application inputs.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsAddingLink(!isAddingLink);
                      if (!isAddingLink) {
                        setNewLinkCategory('linkedin');
                        setNewLinkLabel('LinkedIn Profile');
                        setNewLinkUrl('https://linkedin.com/in/');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
                  >
                    {isAddingLink ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAddingLink ? 'Close Form' : 'Add Link'}</span>
                  </button>
                </div>

                {/* Quick Platform Add Presets */}
                {availablePresets.length > 0 && (
                  <div className="space-y-1.5 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Quick Add Platform
                      </span>
                      <span className="text-[10px] text-slate-500">Click to instantly add</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {availablePresets.map((preset) => (
                        <button
                          key={preset.category}
                          onClick={() => handleQuickAddPreset(preset.category, preset.label, preset.defaultUrl)}
                          className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3 h-3 text-indigo-400" />
                          <span>{preset.label.replace(' Profile', '').replace(' Website', '')}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setIsAddingLink(true);
                          setNewLinkCategory('custom');
                          setNewLinkLabel('');
                          setNewLinkUrl('');
                        }}
                        className="px-2.5 py-1 rounded-md bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/50 text-indigo-300 hover:text-indigo-200 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-indigo-400" />
                        <span>Custom Link</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline Add Link Form Card */}
                {isAddingLink && (
                  <div className="bg-slate-900/90 border border-indigo-500/50 rounded-xl p-4 space-y-3 shadow-lg animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Add New Professional Link</span>
                      </span>
                      <button
                        onClick={() => setIsAddingLink(false)}
                        className="text-slate-400 hover:text-slate-200 text-xs p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Platform / Type</label>
                        <select
                          value={newLinkCategory}
                          onChange={(e) => {
                            const cat = e.target.value;
                            setNewLinkCategory(cat);
                            const found = LINK_PRESETS.find((p) => p.category === cat);
                            if (found && cat !== 'custom') {
                              setNewLinkLabel(found.label);
                              if (!newLinkUrl || newLinkUrl === 'https://') {
                                setNewLinkUrl(found.defaultUrl);
                              }
                            } else if (cat === 'custom') {
                              setNewLinkLabel('');
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          {LINK_PRESETS.map((p) => (
                            <option key={p.category} value={p.category}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Display Label</label>
                        <input
                          type="text"
                          value={newLinkLabel}
                          onChange={(e) => setNewLinkLabel(e.target.value)}
                          placeholder="e.g. My GitHub, Personal Portfolio"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">URL *</label>
                      <input
                        type="url"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddLink();
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsAddingLink(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddLink}
                        disabled={!newLinkUrl.trim()}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Link</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* List of Links with Delete, Rename, Test, and Copy Options */}
                <div className="space-y-3">
                  {currentLinks.length === 0 ? (
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-8 text-center">
                      <Link2 className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                      <h3 className="text-sm font-semibold text-slate-300">No professional links saved</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Add your LinkedIn, GitHub, portfolio, or custom website links to enable 1-click URL autofill on job boards.
                      </p>
                      <button
                        onClick={() => {
                          setIsAddingLink(true);
                          setNewLinkCategory('linkedin');
                          setNewLinkLabel('LinkedIn Profile');
                          setNewLinkUrl('https://linkedin.com/in/');
                        }}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Link</span>
                      </button>
                    </div>
                  ) : (
                    currentLinks.map((link) => {
                      const isCopied = copiedLinkId === link.id;
                      const isEditingLabel = editingLinkLabelId === link.id;

                      return (
                        <div
                          key={link.id}
                          className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 transition-all space-y-2.5 shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                                {renderLinkIcon(link.category)}
                              </div>

                              {isEditingLabel ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={editLinkLabelValue}
                                    onChange={(e) => setEditLinkLabelValue(e.target.value)}
                                    className="bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateLink(link.id, 'label', editLinkLabelValue.trim() || link.label);
                                        setEditingLinkLabelId(null);
                                      }
                                      if (e.key === 'Escape') setEditingLinkLabelId(null);
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      handleUpdateLink(link.id, 'label', editLinkLabelValue.trim() || link.label);
                                      setEditingLinkLabelId(null);
                                    }}
                                    className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingLinkLabelId(null)}
                                    className="p-1 text-slate-400 hover:text-slate-300 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs font-semibold text-white truncate">
                                    {link.label}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingLinkLabelId(link.id);
                                      setEditLinkLabelValue(link.label);
                                    }}
                                    title="Rename label"
                                    className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                                    {link.category}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons: Open, Copy, Delete */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {link.url && (
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Test / Open Link"
                                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              <button
                                onClick={() => handleCopyLink(link.id, link.url)}
                                title={isCopied ? 'Copied!' : 'Copy URL'}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  isCopied
                                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                              {/* Delete Option */}
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                title={`Delete ${link.label}`}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg border border-slate-800 hover:border-red-900/40 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* URL Input */}
                          <div>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-slate-900 border border-slate-800/90 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-all"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}

          {/* FR-06: Resumes */}
          {activeSection === 'resumes' && (
            <div className="space-y-5">
              {/* Header with Title and Upload Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <span>Stored Resumes & CVs (FR-06)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload multiple resumes for specialized roles, choose your default primary CV, and manage files.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.rtf,.md"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleUploadResumeFiles(e.target.files);
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Resumes</span>
                  </button>
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(false);
                  if (e.dataTransfer.files) handleUploadResumeFiles(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDraggingResume
                    ? 'border-indigo-500 bg-indigo-950/30 scale-[1.01]'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shadow-inner">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 hover:text-indigo-400 transition-colors">
                      Click to browse
                    </span>
                    <span className="text-xs text-slate-400"> or drag & drop multiple resume files here</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap justify-center font-mono">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">.PDF</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">.DOCX</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">.DOC</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">.TXT</span>
                    <span className="text-slate-400">· Multiple files supported</span>
                  </div>
                </div>
              </div>

              {/* Information Banner */}
              <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-lg p-3 flex items-start gap-2.5">
                <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-indigo-300">Default Primary Resume:</span> The resume marked as default is automatically attached when 1-click autofill detects resume upload fields on platforms like Greenhouse, Lever, and Workday.
                </div>
              </div>

              {/* Resume List */}
              <div className="space-y-3">
                {formData.resumes.length === 0 ? (
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-8 text-center">
                    <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-slate-300">No resumes stored yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Upload your CVs or resumes above to enable 1-click document attachment during job applications.
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload First Resume</span>
                    </button>
                  </div>
                ) : (
                  formData.resumes.map((res) => {
                    const isDefault = !!res.isDefault;
                    const isPreviewing = previewResumeId === res.id;
                    const isEditingTitle = editingResumeId === res.id;
                    const isEditingContent = editingContentResumeId === res.id;
                    const extension = res.fileName.split('.').pop()?.toUpperCase() || 'DOC';

                    return (
                      <div
                        key={res.id}
                        className={`border rounded-xl p-4 transition-all ${
                          isDefault
                            ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm shadow-emerald-950/30'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* File Details */}
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                                  extension === 'PDF'
                                    ? 'bg-red-950/80 border border-red-800/60 text-red-300'
                                    : extension === 'DOCX' || extension === 'DOC'
                                    ? 'bg-blue-950/80 border border-blue-800/60 text-blue-300'
                                    : 'bg-indigo-950/80 border border-indigo-800/60 text-indigo-300'
                                }`}
                              >
                                {extension}
                              </div>
                              {isDefault && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              {isEditingTitle ? (
                                <div className="flex items-center gap-1.5 my-0.5">
                                  <input
                                    type="text"
                                    value={editTitleValue}
                                    onChange={(e) => setEditTitleValue(e.target.value)}
                                    className="bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveEditTitle(res.id);
                                      if (e.key === 'Escape') setEditingResumeId(null);
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSaveEditTitle(res.id)}
                                    className="p-1 text-emerald-400 hover:text-emerald-300"
                                    title="Save title"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingResumeId(null)}
                                    className="p-1 text-slate-400 hover:text-slate-300"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold text-white truncate">
                                    {res.title || res.fileName}
                                  </span>
                                  <button
                                    onClick={() => handleStartEditTitle(res)}
                                    className="text-slate-400 hover:text-slate-300 p-0.5"
                                    title="Rename title"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  {isDefault ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/90 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/60 font-semibold font-mono">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      Default Primary
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      Secondary
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-slate-400 font-mono truncate max-w-[220px]">
                                  {res.fileName}
                                </span>
                                <span>·</span>
                                <span>{res.fileSize}</span>
                                <span>·</span>
                                <span>Uploaded {new Date(res.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Options: Select Default, Download, Preview, Delete */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {/* Option 1: Select Default */}
                            {isDefault ? (
                              <div className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5 shadow-sm">
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Default</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSetDefaultResume(res.id)}
                                title="Select this resume as your default primary"
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/50 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                              >
                                <Star className="w-3.5 h-3.5 text-amber-400/80" />
                                <span>Select Default</span>
                              </button>
                            )}

                            {/* Option 2: Download */}
                            <button
                              onClick={() => handleDownloadResume(res)}
                              title="Download resume file"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {/* Option 3: View / Inspect Text */}
                            <button
                              onClick={() => setPreviewResumeId(isPreviewing ? null : res.id)}
                              title={isPreviewing ? 'Hide preview' : 'View extracted resume text'}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isPreviewing
                                  ? 'text-indigo-400 bg-indigo-950 border-indigo-800/50'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Option 4: Delete */}
                            <button
                              onClick={() => handleDeleteResume(res.id)}
                              title="Delete this resume"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Text Content Preview Drawer */}
                        {isPreviewing && (
                          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Extracted Content & Notes</span>
                              </span>
                              {!isEditingContent ? (
                                <button
                                  onClick={() => handleStartEditContent(res)}
                                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit Content</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSaveEditContent(res.id)}
                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingContentResumeId(null)}
                                    className="text-[11px] text-slate-400 hover:text-slate-300 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>

                            {isEditingContent ? (
                              <textarea
                                rows={4}
                                value={editContentValue}
                                onChange={(e) => setEditContentValue(e.target.value)}
                                className="w-full bg-slate-950 border border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                              />
                            ) : (
                              <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                {res.textContent || 'No text extracted. Binary document ready for attachment.'}
                              </div>
                            )}

                            <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                              <span>ID: {res.id}</span>
                              <span>{res.textContent?.length || 0} characters</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Section: Other & Custom Q&A */}
          {activeSection === 'other' && (() => {
            const allQuestions = formData.otherQuestions || [];
            const filteredQuestions = allQuestions.filter((q) => {
              const query = qnaSearchQuery.toLowerCase().trim();
              const matchesSearch =
                !query ||
                q.question.toLowerCase().includes(query) ||
                q.answer.toLowerCase().includes(query) ||
                (q.category && q.category.toLowerCase().includes(query));
              const matchesCategory =
                qnaCategoryFilter === 'All' ||
                (q.category && q.category.toLowerCase() === qnaCategoryFilter.toLowerCase());
              return matchesSearch && matchesCategory;
            });

            const getCategoryBadgeClass = (category: string = 'General') => {
              switch (category.toLowerCase()) {
                case 'behavioral':
                  return 'bg-purple-950/80 text-purple-300 border-purple-800/70';
                case 'logistics':
                  return 'bg-amber-950/80 text-amber-300 border-amber-800/70';
                case 'technical':
                  return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/70';
                case 'authorization':
                  return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/70';
                default:
                  return 'bg-slate-800 text-slate-300 border-slate-700';
              }
            };

            return (
              <div className="space-y-5">
                {/* Header with Title and Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-indigo-400" />
                      <span>Other & Custom Q&A</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Store recurring or unique application questions and your tailored answers. The Chrome extension auto-fills these when job forms ask custom prompts.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsAddingQnA(!isAddingQnA);
                      if (!isAddingQnA) {
                        setNewQnAQuestion('');
                        setNewQnAAnswer('');
                        setNewQnACategory('General');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
                  >
                    {isAddingQnA ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAddingQnA ? 'Close Form' : 'Add Question & Answer'}</span>
                  </button>
                </div>

                {/* Common Question Suggestions Bar */}
                <div className="space-y-1.5 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-indigo-400" />
                      <span>Quick Prompts (Click to add)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Popular application questions</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {QUESTION_SUGGESTIONS.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplySuggestion(sug)}
                        className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3 h-3 text-indigo-400" />
                        <span>{sug.question.length > 32 ? sug.question.slice(0, 32) + '...' : sug.question}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search & Category Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={qnaSearchQuery}
                      onChange={(e) => setQnaSearchQuery(e.target.value)}
                      placeholder="Search questions or answers..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {['All', 'Behavioral', 'Logistics', 'Technical', 'Authorization', 'General'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setQnaCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                          qnaCategoryFilter === cat
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add New Q&A Form Card */}
                {isAddingQnA && (
                  <div className="bg-slate-900/90 border border-indigo-500/50 rounded-xl p-4 space-y-3 shadow-lg animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Add New Custom Question & Answer</span>
                      </span>
                      <button
                        onClick={() => setIsAddingQnA(false)}
                        className="text-slate-400 hover:text-slate-200 text-xs p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Question / Prompt *
                        </label>
                        <input
                          type="text"
                          value={newQnAQuestion}
                          onChange={(e) => setNewQnAQuestion(e.target.value)}
                          placeholder="e.g. Why are you interested in this role?, Notice period?, etc."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Category
                        </label>
                        <select
                          value={newQnACategory}
                          onChange={(e) => setNewQnACategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="General">General</option>
                          <option value="Behavioral">Behavioral</option>
                          <option value="Logistics">Logistics (Salary, Notice)</option>
                          <option value="Technical">Technical</option>
                          <option value="Authorization">Work Authorization</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Tailored Answer *
                      </label>
                      <textarea
                        rows={3}
                        value={newQnAAnswer}
                        onChange={(e) => setNewQnAAnswer(e.target.value)}
                        placeholder="Type your ideal response to be automatically filled on job application forms..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsAddingQnA(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddQnA}
                        disabled={!newQnAQuestion.trim() || !newQnAAnswer.trim()}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save Q&A</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* List of Questions & Answers */}
                <div className="space-y-3">
                  {filteredQuestions.length === 0 ? (
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-8 text-center">
                      <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                      <h3 className="text-sm font-semibold text-slate-300">
                        {qnaSearchQuery || qnaCategoryFilter !== 'All'
                          ? 'No questions match your current filter'
                          : 'No custom questions added yet'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Add answers to unique interview questions or select one from the quick prompts above.
                      </p>
                      <button
                        onClick={() => {
                          setIsAddingQnA(true);
                          setNewQnAQuestion('Why are you interested in joining our company?');
                          setNewQnACategory('Behavioral');
                          setNewQnAAnswer('I am excited by your engineering mission, modern architecture, and collaborative developer culture.');
                        }}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Sample Question</span>
                      </button>
                    </div>
                  ) : (
                    filteredQuestions.map((qna) => {
                      const isEditing = editingQnAId === qna.id;
                      const isCopied = copiedQnAId === qna.id;

                      return (
                        <div
                          key={qna.id}
                          className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all space-y-3 shadow-xs"
                        >
                          {isEditing ? (
                            /* Inline Edit Mode */
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                                    Question
                                  </label>
                                  <input
                                    type="text"
                                    value={editQnAQuestion}
                                    onChange={(e) => setEditQnAQuestion(e.target.value)}
                                    className="w-full bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                    autoFocus
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                                    Category
                                  </label>
                                  <select
                                    value={editQnACategory}
                                    onChange={(e) => setEditQnACategory(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                  >
                                    <option value="General">General</option>
                                    <option value="Behavioral">Behavioral</option>
                                    <option value="Logistics">Logistics</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Authorization">Work Authorization</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                                  Answer
                                </label>
                                <textarea
                                  rows={3}
                                  value={editQnAAnswer}
                                  onChange={(e) => setEditQnAAnswer(e.target.value)}
                                  className="w-full bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                                />
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  onClick={() => setEditingQnAId(null)}
                                  className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-md cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEditQnA(qna.id)}
                                  className="px-3.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save Changes</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Read View Mode */
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                                      qna.category
                                    )}`}
                                  >
                                    {qna.category || 'General'}
                                  </span>
                                  <h3 className="text-xs font-bold text-white leading-snug">
                                    {qna.question}
                                  </h3>
                                </div>

                                {/* Actions: Copy, Edit, Delete */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleCopyQnAAnswer(qna.id, qna.answer)}
                                    title={isCopied ? 'Copied to clipboard!' : 'Copy answer text'}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      isCopied
                                        ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                                  >
                                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>

                                  <button
                                    onClick={() => handleStartEditQnA(qna)}
                                    title="Edit question & answer"
                                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteQnA(qna.id)}
                                    title="Delete this Q&A"
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg border border-slate-800 hover:border-red-900/40 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Answer text container */}
                              <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {qna.answer}
                              </div>

                              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                <span>Autofill Key: otherQuestions.{qna.id}</span>
                                <span>{qna.answer.length} chars</span>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
