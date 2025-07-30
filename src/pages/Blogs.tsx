import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ArrowRight, User, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const blogPosts = [
  {
    id: 4,
    title: "What is Hirebuddy?",
    subtitle: "Making job hunting effortless for job seekers everywhere",
    excerpt: "Finding a job sucks and we're here to fix that. Learn how Hirebuddy automates your entire job search process.",
    author: "Sarvagya",
    date: "2024-01-01",
    readTime: "6 min read",
    category: "Company",
    content: `Finding a job sucks and we're here to fix that.

Hi everyone, how are you doing? If you've ended up on this page, chances are you're either looking for a job, one of our competitors, an investor (pls give us your money), or someone who just likes to read. Don't worry. We got you. In today's blog we'll be going over Hirebuddy- what exactly is it, and how can we help you out?

Well, job hunting is a painful process. Let's talk about how a normal person goes about getting a job. The first step starts at finding good openings, just like everyone, you open 10s of online job portals and spend hours and hours scrolling through them to find relevant openings. You found one that caught your eye- oops, it requires 10 years of experience, found another that seems just like the perfect role - oh no it's unpaid. Hours and hours are spent scrolling through platforms trying to find the best openings.

Now let's assume after hours of us scrolling to find good openings, we've found a few we'd like to apply to. Now the harder part starts- applying to these places. Why do we have to fill out the same forms over and over again?

You create a perfect CV, a nicely written cover letter, and fill out the same boring forms hoping to hear back. If you want to stand out from the rest of the applicants, you have to do things like change your CV every time according to the JD, create a new cover letter for every role you apply to, research the company, and send personally curated cold emails. All of this to never hear back from companies.

Hours and hours are wasted finding out these jobs and applying to them and that's what exactly Hirebuddy is here to fix.

<h2 class="text-3xl font-semibold text-[#403334] mt-8 mb-4">What is Hirebuddy?</h2>

Well, if I were to describe it one line- Hirebuddy is the AI assistant that finds, matches, and applies to jobs- so you don't have to.

Hirebuddy is a platform that automates the entire job/ internship search and application process. Making finding a job effortless for job seekers.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">How does our platform work?</h3>

Well, simple- you come to our website, sign in, and go through the basic onboarding.

Don't have a resume? Don't worry - you can use our tool to make one. Get ATS scores, relevancy to roles you're applying and tailored feedback on what you can do to make your resume stand out. No more having multiple templates open trying to find the best one. Let Hirebuddy help you with that.

Remember the part where I talked about going through multiple job boards? Well, we fix that. Our job board picks up openings from all over the internet, all in one place, and our unique relevancy scoring system matches you with the best openings catered to you. No more having to have 10s of sites open and having to scroll through all of them. Get matched with the best jobs meant for you with no hassle. Landing a job isn't about endless scrolling - it's about smart strategy.

Get matched with jobs that are tailored to your skills and goals, in one single click.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Well I got matched with good jobs, now what's next?</h3>

Usually it's creating new CVs, cover letters, writing cold emails and filling out boring and repetitive forms but as Chadwick Boseman said- (insert we don't do that here meme)

Hirebuddy takes care of sending out your applications to the companies you want to. We fill out forms, create new CVs for every role, create cover letters , write personalised cold emails - all of that. We send out your job applications so you don't have to.

Job applications should be personalised and not templatised and that is exactly what Hirebuddy believes in. Every application we send is tailored to the role, the company, and your profile. No two jobs are the same, so your application shouldn't be either. Whether it's adjusting your CV to highlight relevant skills or writing a cold email that actually gets opened, we make sure you're putting your best foot forward - every single time. With Hirebuddy, you're not applying more, you're applying smarter.

Get notified of every place we've applied to on your behalf through your personal dashboard. Track everything - upcoming interviews, number of offers, application statuses - all in one place. No spreadsheets, no guesswork, just clarity and control.

We believe job-seeking should be about you -your skills, your goals - not about managing forms or copy-pasting cover letters. Hirebuddy handles the busywork so you can focus on what actually moves the needle.

Hirebuddy handles the repetitive stuff so you can focus on preparing, upskilling, and landing the job.

We've helped multiple people land roles so far and would love to help you out too! Whether you're a student looking for internships, a fresh graduate, or a working professional switching jobs — Hirebuddy works for you. Check us out today!

Best

Sarvagya.`
  },
  {
    id: 1,
    title: "Why You're Not Hearing Back After Applying to Jobs",
    subtitle: "And what to actually do about it",
    excerpt: "You spent hours updating your CV, hit apply, and then… silence. If this sounds familiar, you're not alone. Here's why it happens and how to fix it.",
    author: "Hirebuddy Team",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Job Search",
    content: `You spent hours updating your CV, hit apply, and then… silence.

No email. No rejection. Nothing.

If this sounds familiar, you're not alone.

Thousands of people apply to jobs every day and never hear back. Not because they're not good enough, but because the system is broken, boring, and overloaded.

Here's why it happens -and how to fix it.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">1. Your CV isn't tailored</h3>

Most people use the same CV for every job. Recruiters can tell.

The company wants to feel like you actually care about their role, not just any job.

<strong>Fix it:</strong>

Customize your CV for each application. Match keywords, reorder your experiences, tweak the summary. It doesn't take long, especially if you're using Hirebuddy.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">2. You're applying on the wrong platforms</h3>

Sites like LinkedIn and Naukri are flooded. Some jobs get 1,000+ applicants in a few hours.

By the time you apply, a shortlist is already being made.

<strong>Fix it:</strong>

Go beyond job boards. Apply through company career pages. Reach out to recruiters. Use platforms that help you apply early and often - like Hirebuddy, which finds jobs for you across the internet and applies with your updated resume.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">3. Your CV didn't pass the ATS</h3>

Even if you're a great fit, your CV might not even reach a human.

Applicant Tracking Systems (ATS) reject CVs that don't match formatting or keywords.

<strong>Fix it:</strong>

Use simple formatting. Add the right keywords. No charts. No tables. Or use Hirebuddy's Resume Builder - it formats everything to pass ATS automatically.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">4. You didn't follow up</h3>

Most people apply and wait.

But hiring managers are busy. Following up (the right way) can move you ahead of 90% of applicants.

<strong>Fix it:</strong>

Send a short, polite email to the recruiter. Mention the role, show your interest, and ask if they need anything else. Hirebuddy can even help write and send cold emails to recruiters.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">5. It's a numbers game, but you're playing it wrong</h3>

Some people mass-apply without any effort. Others apply to just a few and wait weeks.

<strong>Fix it:</strong>

You need the right volume with the right approach. Apply to more roles, but with customized CVs and smart follow-ups. That's what Hirebuddy is built to do.

If you're not hearing back, don't take it personally.

The job search process isn't fair but you can play it smarter.

Your time should go into <strong>preparing for interviews</strong>, not wasting hours filling out forms and rewriting resumes. That's what we built Hirebuddy for.

Let us handle the boring stuff. You focus on getting hired.

hirebuddy.net.`
  },
  {
    id: 2,
    title: "Your CV Sucks (Unless You've Done This)",
    subtitle: "A complete guide to building a CV that gets interviews",
    excerpt: "Most CVs look the same. Recruiters spend 6-8 seconds on each one. Here's how to make yours stand out and actually get interviews.",
    author: "Hirebuddy Team",
    date: "2024-01-10",
    readTime: "10 min read",
    category: "Resume Tips",
    content: `Let's be real - most CVs look the same. And recruiters? They spend <strong>6–8 seconds</strong> on each one. That's less time than it takes to open an Instagram story.

So how do you make yours stand out?

This isn't just a guide on formatting or adding buzzwords. It's about building a CV that actually gets you interviews - and doesn't get lost in some ATS (Applicant Tracking System) black hole.

Whether you're applying for your first job or your fifth, here's how to build a CV that does the heavy lifting for you.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Step 1: Know Who You're Writing For</h3>

Your CV isn't a biography. It's a <strong>sales pitch</strong>.

Recruiters are scanning for 3 things:

• Are you qualified for the role?
• Can you communicate clearly?
• Did you put in any effort, or did you just send the same thing to 200 companies?

<strong>Tip:</strong> Tailor your CV for every role - even small tweaks go a long way. (Yes, it's annoying. Yes, it works. Yes Hirebuddy helps you do that.)

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Step 2: Make It ATS-Friendly</h3>

Most big companies use software (called ATS) to filter CVs before a human even sees them. That means:

• No fancy fonts or layouts
• No images, charts, or tables
• Keywords matter - mirror the language from the job description
• Save as PDF (unless the job says otherwise)

If your CV looks beautiful but no one ever replies… you probably built it for humans, not robots. Use our Hirebuddy Resume Maker to create an ATS friendly resume.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Step 3: Front-Load Your Impact</h3>

Your CV needs to <strong>grab attention fast</strong>.

The top 1/3rd of your CV should scream:

<blockquote class="border-l-4 border-[#b24e55] pl-4 italic text-[#4A3D55] my-4">"Hey, I'm the person you're looking for."</blockquote>

Use a sharp summary section:

• Who you are
• What you've done
• What kind of roles you're looking for

And under each experience, skip the boring job description. Instead, focus on:

• <strong>What you did</strong>
• <strong>What changed because of it</strong>
• <strong>Numbers > Adjectives</strong>

<div class="bg-[#fff7f8] p-4 rounded-lg my-4">
<strong>Example:</strong>

❌ "Managed social media accounts"

✅ "Grew Instagram following by 60% in 3 months through organic content and influencer outreach"
</div>

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Step 4: Cut the BS</h3>

Your CV isn't your life story. It's a highlight reel.

Cut:

• Objective statements ("Looking for a challenging role…" - boring)
• Soft skills sections ("Hardworking, team player, punctual" - cool, so is everyone)
• Irrelevant info (your class 10th % doesn't belong here)

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Step 5: Use a Smarter Tool</h3>

Building a solid, clean, ATS-friendly CV shouldn't take hours - or your soul.

That's why we built <strong>Hirebuddy's CV Generator</strong> - designed to:

✅ Auto-format your resume to pass ATS filters

✅ Customize for different roles in one click

✅ Highlight your skills and experience in a way that actually <em>gets noticed</em>

✅ And yes, it looks good <em>and</em> gets read

No design skills needed. No BS. Just upload your info, tweak a few things, and you're done.

Create your CV now - (enter link to it)

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Think Like a Recruiter</h3>

If you were skimming 200 CVs a day, what would <em>you</em> look for?

Probably not someone who listed "MS Word" as a skill.

You'd want clarity, relevance, and impact. So give them that.

Your CV is your first impression. Make it count.

And if you want to skip the drama and do it the smart way, let <strong>Hirebuddy</strong> build it for you.

<strong>Ready to stand out from the stack?</strong>

Use Hirebuddy's free CV tool and apply like a pro.

[Get started now →]`
  },
  {
    id: 3,
    title: "Stop Winging It: A Real Guide to Cracking Job Interviews",
    subtitle: "Turn interviews from nerve-wracking to natural conversations",
    excerpt: "Most people think interviews are about answering questions. They're not. They're about owning your story and showing you can solve problems.",
    author: "Hirebuddy Team",
    date: "2024-01-05",
    readTime: "12 min read",
    category: "Interview Prep",
    content: `So you landed an interview - congrats. Now what?

Most people think interviews are about answering questions. They're not. They're about <em>owning your story</em> and showing that you can solve problems for the company.

Whether you're a fresh grad or making a switch, this guide will help you walk into interviews with confidence (and not panic-googling "how to answer tell me about yourself" 10 minutes before).

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Step 1: Know the Role Better Than the JD</h3>

Most job descriptions are very vague. Your job is to decode them.

Ask yourself:

• What will this person actually do in the first 3 months?
• What skills are <em>must-haves</em> vs nice-to-haves?
• Can I tie my experience to the core of this role?

Tip: Look up people already in similar roles at the company on LinkedIn - reverse engineer what made them a fit.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Step 2: Do Your <em>Real</em> Research</h3>

Everyone says "read about the company." Cool. But go deeper.

Look into:

• Recent news, funding, or product launches.
• What the founders or execs are talking about online.
• Future plans for the company

Use this to <em>tailor</em> your answers. Show them you're not just applying to 50 jobs and praying something sticks. Show them that you've done your homework. Brownie points if you can establish some common connection between you and the interviewer.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Step 3: Nail "Tell Me About Yourself"</h3>

This isn't your life story. It's your <em>elevator pitch</em>.

Structure:

1. Who you are (short summary)
2. What you've done (highlight relevant experience)
3. Why this role/company (show intent)

<div class="bg-[#fff7f8] p-4 rounded-lg my-4">
<strong>Example:</strong> "I'm a recent CS grad who spent the last year building small projects with real-world users. I love working on products that make life easier - which is why this role at [Company] instantly stood out."
</div>

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Step 4: Use the STAR Method, Always</h3>

For every behavioral question ("Tell me about a time you…"), use this:

• <strong>S</strong>ituation – Set the context
• <strong>T</strong>ask – What needed to be done?
• <strong>A</strong>ction – What <em>you</em> did
• <strong>R</strong>esult – What happened (with numbers if possible)

Interviewers love structure. Don't ramble.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">Step 5: Avoid These Rookie Mistakes</h3>

• Saying "I'm a perfectionist" when asked about weaknesses. Just... don't.
• Not preparing any questions for the interviewer. Always have 2-3 ready.
• Talking only about <em>yourself</em>. Always link back to how you'll add value to <em>them</em>.

The best interviews feel like conversations, not interrogations.

The more you prepare, the more natural you'll sound. Don't memorize answers. Internalize <em>why</em> you're a good fit. Then go in there and show them.

You've got this.

<h3 class="text-2xl font-semibold text-[#403334] mt-8 mb-4">P.S. : Hate Applying to Jobs?</h3>

We built <strong>Hirebuddy</strong> to take care of the worst parts of the job hunt - from finding relevant roles to applying with custom CVs and emails. We make job hunting effortless.

You focus on prepping for interviews. Let us handle the boring stuff.

Join our waitlist now-

(put link).`
  },
  
];

const Blogs = () => {
  const [selectedPost, setSelectedPost] = useState<typeof blogPosts[0] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const postId = searchParams.get('post');
    if (postId) {
      const post = blogPosts.find(p => p.id === parseInt(postId));
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [searchParams]);

  const handleBackToList = () => {
    setSelectedPost(null);
    setSearchParams({});
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-[#fff7f8]">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              onClick={handleBackToList}
              variant="ghost"
              className="mb-8 text-[#b24e55] hover:text-[#E75A82] hover:bg-[#ffe0e0]"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Back to all blogs
            </Button>

            <article className="max-w-4xl mx-auto">
              <header className="mb-12">
                <Badge className="mb-4 bg-[#ffe0e0] text-[#b24e55] hover:bg-[#ffe0e0]">
                  {selectedPost.category}
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-mabry font-semibold text-[#403334] mb-4">
                  {selectedPost.title}
                </h1>
                {selectedPost.subtitle && (
                  <p className="text-xl md:text-2xl text-[#4A3D55] font-light mb-8">
                    {selectedPost.subtitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#b26469]">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedPost.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedPost.readTime}
                  </div>
                </div>
              </header>

              <div className="prose prose-lg max-w-none">
                <div 
                  className="whitespace-pre-line text-[#403334] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
              </div>

              <div className="mt-16 pt-8 border-t border-[#ffe0e0]">
                <div className="bg-gradient-to-r from-[#b24e55] to-[#E3405F] rounded-2xl p-8 text-white text-center">
                  <h3 className="text-2xl font-mabry font-semibold mb-4">
                    Ready to transform your job search?
                  </h3>
                  <p className="text-lg mb-6 opacity-90">
                    Let Hirebuddy handle the applications while you focus on landing the job.
                  </p>
                  <Button
                    className="bg-white text-[#b24e55] hover:bg-gray-100 font-medium px-8 py-3 rounded-xl"
                    onClick={() => {
                      window.location.href = "/signup";
                    }}
                  >
                    Sign Up
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </article>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f8]">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-[#fff7f8]">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <div className="inline-flex items-center rounded-full border border-[#ffe0e0] bg-[#ffe0e0] px-4 py-1.5">
                <span className="text-sm font-medium text-[#3e3233]">Latest Insights</span>
                <div className="mx-2 h-4 w-[1px] bg-[#b16368]" />
                <span className="text-sm font-semibold text-[#b16368]">
                  Career tips & guides
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl text-center font-mabry font-semibold text-[#403334] max-w-4xl mx-auto mb-6">
              Learn from our <span className="text-[#b24e55]">experts</span> and land your dream job
            </h1>

            <p className="font-light text-lg md:text-xl text-center text-[#4A3D55] max-w-3xl mx-auto mb-12">
              Practical advice, proven strategies, and insider tips to help you navigate the modern job market and accelerate your career.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-4 bg-[#FFEDED]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white border-2 border-[#ffb8b8] hover:border-[#b24e55] transition-all duration-300 cursor-pointer group hover:shadow-[0_10px_40px_rgba(178,78,85,0.2)]"
                  onClick={() => setSelectedPost(post)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-[#ffe0e0] text-[#b24e55] hover:bg-[#ffe0e0]">
                        {post.category}
                      </Badge>
                      <div className="flex items-center text-sm text-[#b26469]">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-mabry font-semibold text-[#403334] group-hover:text-[#b24e55] transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    {post.subtitle && (
                      <CardDescription className="text-[#b24e55] font-medium text-base">
                        {post.subtitle}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#4A3D55] leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-[#b26469]">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#b24e55] hover:text-[#E75A82] hover:bg-[#ffe0e0] group-hover:translate-x-1 transition-all"
                      >
                        Read more
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#b24e55] to-[#E3405F]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-mabry font-semibold text-white mb-6">
              Ready to put these tips into action?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Stop wasting time on manual applications. Let Hirebuddy find and apply to jobs for you.
            </p>
            <Button
              className="bg-white text-[#b24e55] hover:bg-gray-100 font-medium px-8 py-4 rounded-xl text-lg"
              onClick={() => {
                window.location.href = "/signup";
              }}
            >
              Sign Up
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blogs; 