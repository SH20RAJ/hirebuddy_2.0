export const emailTemplates = [
  { 
    id: 'intro', 
    name: 'Introduction', 
    subject: 'Quick introduction - {{firstName}}',
    content: `Hi {{firstName}},

I hope this email finds you well. My name is [Your Name] and I'm reaching out because I believe there might be a great opportunity for us to connect.

I noticed your work at {{company}} and was impressed by [specific detail about their company/work]. 

I'd love to schedule a brief 15-minute call to discuss how we might be able to help each other.

Best regards,
[Your Name]`
  },
  { 
    id: 'followup', 
    name: 'Follow-up', 
    subject: 'Following up on my previous email - {{firstName}}',
    content: `Hi {{firstName}},

I wanted to follow up on my previous email about [topic]. I understand you're likely busy, but I believe this could be valuable for {{company}}.

Would you be open to a quick 10-minute conversation this week?

Best regards,
[Your Name]`
  },
  { 
    id: 'partnership', 
    name: 'Partnership Proposal', 
    subject: 'Partnership opportunity for {{company}}',
    content: `Hi {{firstName}},

I've been following {{company}}'s growth and I'm impressed by your work in [industry/field].

I believe there's a great opportunity for collaboration between our companies. We've helped similar businesses [specific benefit/result].

Would you be interested in exploring this further?

Best regards,
[Your Name]`
  }
]; 