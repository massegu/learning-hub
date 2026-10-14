(function(){
  const D=window.LEARNING_DATA=window.LEARNING_DATA||{};
  const q=(id,level,text,opts,a,extra={})=>({id,level,q:text,opts,a,...extra});
  const self=(id,level,text,sample,topic)=>({id,level,q:text,type:'self',sample,topic});

  function primaryEnglish(){
    const x=[];
    [
      ['p-en-001',1,'Choose the correct sentence with the verb “to be”.',['She is twelve.','She are twelve.','She am twelve.','She be twelve.'],'She is twelve.','To be'],
      ['p-en-002',1,'Complete: I ___ a new backpack.',['have got','has got','am got','is got'],'have got','Have got'],
      ['p-en-003',1,'Complete: My brother ___ a bike.',['has got','have got','is got','are got'],'has got','Have got'],
      ['p-en-004',1,'Choose the plural of “child”.',['children','childs','childes','childrens'],'children','Vocabulary'],
      ['p-en-005',1,'Choose the best translation of “biblioteca”.',['library','bookshop','classroom','playground'],'library','School'],
      ['p-en-006',1,'Complete: There ___ two posters on the wall.',['are','is','am','be'],'are','There is / are'],
      ['p-en-007',1,'Complete: There ___ a computer on the desk.',['is','are','have','has'],'is','There is / are'],
      ['p-en-008',1,'Choose: I get up ___ seven o’clock.',['at','in','on','by'],'at','Time'],
      ['p-en-009',1,'Choose: We have English ___ Monday.',['on','at','in','to'],'on','Time'],
      ['p-en-010',1,'Choose the opposite of “difficult”.',['easy','slow','strong','late'],'easy','Vocabulary'],
      ['p-en-011',1,'Complete: He ___ football after school.',['plays','play','playing','played'],'plays','Present simple'],
      ['p-en-012',1,'Complete: They ___ video games on Fridays.',['play','plays','playing','played'],'play','Present simple'],
      ['p-en-013',1,'Choose the correct question.',['Do you like music?','Does you like music?','You do like music?','Are you like music?'],'Do you like music?','Questions'],
      ['p-en-014',1,'Choose the correct negative.',['She does not like onions.','She do not likes onions.','She not like onions.','She does not likes onions.'],'She does not like onions.','Present simple'],
      ['p-en-015',1,'Which word means “a place where you can swim”?',['swimming pool','library','bakery','museum'],'swimming pool','Places'],
      ['p-en-016',1,'Choose the best response: “How are you?”',['I’m fine, thanks.','I’m twelve.','At home.','On Monday.'],'I’m fine, thanks.','Communication'],
      ['p-en-017',1,'Choose the best response: “What time is it?”',['It’s half past five.','It’s sunny.','I’m fine.','It’s mine.'],'It’s half past five.','Communication'],
      ['p-en-018',1,'Complete: My friends ___ very funny.',['are','is','am','be'],'are','To be'],
      ['p-en-019',1,'Choose the correct possessive adjective: “This is Marta. ___ dog is brown.”',['Her','His','Its','Our'],'Her','Possessives'],
      ['p-en-020',1,'Complete: We ___ lunch at school every day.',['have','has','having','had'],'have','Daily routines'],

      ['p-en-021',2,'Look! The dog ___ in the garden.',['is running','runs','run','ran'],'is running','Present continuous'],
      ['p-en-022',2,'Choose: I usually ___ cereal, but today I ___ toast.',['eat / am eating','am eating / eat','eats / am eating','ate / eat'],'eat / am eating','Present simple vs continuous'],
      ['p-en-023',2,'Complete: Yesterday we ___ a film.',['watched','watch','are watching','watches'],'watched','Past simple'],
      ['p-en-024',2,'Choose the past of “go”.',['went','goed','gone','goes'],'went','Past simple'],
      ['p-en-025',2,'Complete: She ___ her homework last night.',['did','do','does','doing'],'did','Past simple'],
      ['p-en-026',2,'Choose the correct sentence with “can”.',['I can swim very well.','I can to swim very well.','I cans swim very well.','I can swimming very well.'],'I can swim very well.','Can'],
      ['p-en-027',2,'Complete: You ___ wear a helmet when you ride a bike.',['should','should to','are should','shoulding'],'should','Advice'],
      ['p-en-028',2,'Choose the comparative: “A train is ___ than a bicycle.”',['faster','fastest','more fast','fast'],'faster','Comparatives'],
      ['p-en-029',2,'Choose the comparative: “This puzzle is ___ than the last one.”',['more difficult','difficulter','most difficult','difficulty'],'more difficult','Comparatives'],
      ['p-en-030',2,'Complete: The cat is ___ the chair.',['under','between of','at','during'],'under','Prepositions'],
      ['p-en-031',2,'Complete: The cinema is ___ the bank and the café.',['between','under','through','during'],'between','Prepositions'],
      ['p-en-032',2,'Choose: How ___ apples do we need?',['many','much','any','some'],'many','Quantifiers'],
      ['p-en-033',2,'Choose: How ___ water do you drink?',['much','many','few','several'],'much','Quantifiers'],
      ['p-en-034',2,'Complete: There aren’t ___ bananas.',['any','some','much','a'],'any','Some / any'],
      ['p-en-035',2,'Complete: There is ___ milk in the fridge.',['some','any','many','an'],'some','Some / any'],
      ['p-en-036',2,'Choose the best instruction.',['Turn left at the traffic lights.','Turning left yesterday.','Left you turn.','You left turn.'],'Turn left at the traffic lights.','Directions'],
      ['p-en-037',2,'What does “borrow” mean?',['take something and return it later','give something forever','buy something','break something'],'take something and return it later','Vocabulary'],
      ['p-en-038',2,'Complete: My birthday is ___ May.',['in','on','at','by'],'in','Time'],
      ['p-en-039',2,'Choose the correct question for this answer: “Because it is fun.”',['Why do you play?','When do you play?','Where do you play?','Who do you play?'],'Why do you play?','Questions'],
      ['p-en-040',2,'Choose the sentence that describes a routine.',['I walk to school every day.','I am walking to school now.','I walked to school yesterday.','I will walk later.'],'I walk to school every day.','Present simple'],

      ['p-en-041',3,'Complete: We are going to ___ a science project tomorrow.',['start','started','starting','starts'],'start','Going to'],
      ['p-en-042',3,'Choose the best prediction: “Look at those dark clouds!”',['It is going to rain.','It rains yesterday.','It is rain every day.','It raining.'],'It is going to rain.','Future'],
      ['p-en-043',3,'Choose the superlative: “Mount Everest is the ___ mountain in the world.”',['highest','higher','most high','high'],'highest','Superlatives'],
      ['p-en-044',3,'Complete: I was tired, ___ I finished the project.',['but','because','so that','or because'],'but','Connectors'],
      ['p-en-045',3,'Complete: We stayed inside ___ it was raining.',['because','but','although of','than'],'because','Connectors'],
      ['p-en-046',3,'Choose the most polite request.',['Could you help me, please?','Help me now.','You help me.','Helping me.'],'Could you help me, please?','Communication'],
      ['p-en-047',3,'Choose the best reply to “Would you like to come to the cinema?”',['Yes, I’d love to.','Yes, I like cinema yesterday.','I am twelve.','At six o’clock.'],'Yes, I’d love to.','Communication'],
      ['p-en-048',3,'Read: “Leo missed the bus, so he called his father.” Why did Leo call his father?',['Because he missed the bus.','Because he found the bus.','Because he was at school.','Because he wanted breakfast.'],'Because he missed the bus.','Reading'],
      ['p-en-049',3,'Read: “Nora studied for the test and went to bed early. The next morning she felt calm.” What probably helped Nora feel calm?',['She prepared and rested.','She forgot the test.','She watched TV all night.','She missed school.'],'She prepared and rested.','Reading'],
      ['p-en-050',3,'Choose the sentence with correct word order.',['I often play basketball after school.','I play often after school basketball.','Often I basketball play school after.','I basketball after often play school.'],'I often play basketball after school.','Word order'],
      ['p-en-051',3,'Complete: If you are thirsty, you ___ drink some water.',['should','should to','are should','must to'],'should','Advice'],
      ['p-en-052',3,'Which sentence compares two things?',['My bike is lighter than yours.','My bike is blue.','I ride my bike daily.','This is my bike.'],'My bike is lighter than yours.','Comparatives'],
      ['p-en-053',3,'Choose: “I don’t have ___ homework today.”',['much','many','a few','several'],'much','Quantifiers'],
      ['p-en-054',3,'Choose the correct sentence with the past of “be”.',['We were at home yesterday.','We was at home yesterday.','We are at home yesterday.','We be at home yesterday.'],'We were at home yesterday.','Past of be'],
      ['p-en-055',3,'Choose the correct negative past sentence.',['I didn’t see the message.','I didn’t saw the message.','I don’t saw the message.','I not see the message.'],'I didn’t see the message.','Past simple'],
      ['p-en-056',3,'Which phrase is useful when you do not understand?',['Could you repeat that, please?','Never mind me.','I repeat you.','Say again now.'],'Could you repeat that, please?','Communication']
    ].forEach(r=>x.push(q(r[0],r[1],r[2],r[3],r[4],{topic:r[5]})));
    x.push(self('p-en-057',3,'Write 3 sentences about what you usually do after school.','Example: I usually have a snack, do my homework and then play basketball.','Writing'));
    x.push(self('p-en-058',3,'Write a short invitation to a friend for a weekend plan. Include place and time.','Example: Hi Sam! Would you like to come to the park on Saturday at 11?','Writing'));
    x.push(self('p-en-059',3,'Describe your favourite game, sport or hobby in 3-4 simple sentences.','Example: My favourite hobby is football. I play twice a week. I like it because I can be with my friends.','Writing'));
    x.push(self('p-en-060',3,'Write 3 sentences about a plan for next weekend using “going to”.','Example: I am going to visit my cousins. We are going to play outside and watch a film.','Writing'));
    return x;
  }

  function middleEnglish(){
    const x=[];
    const rows=[
      ['m-en-001',1,'Choose the correct sentence.',['I usually check my messages after breakfast.','I am usually check my messages after breakfast.','I usually checking my messages.','I checks usually my messages.'],'I usually check my messages after breakfast.','Present simple'],
      ['m-en-002',1,'Complete: My friends ___ for the bus right now.',['are waiting','wait','waits','waited'],'are waiting','Present continuous'],
      ['m-en-003',1,'Choose: “What ___ you doing?”',['are','do','is','did'],'are','Present continuous'],
      ['m-en-004',1,'Complete: Yesterday I ___ my headphones at home.',['left','leave','leaved','am leaving'],'left','Past simple'],
      ['m-en-005',1,'Choose the past of “buy”.',['bought','buyed','brought','buys'],'bought','Past simple'],
      ['m-en-006',1,'Complete: We ___ dinner when the lights went out.',['were having','had','are having','have'],'were having','Past continuous'],
      ['m-en-007',1,'Choose: She ___ a shower when I called.',['was having','has','is having','have'],'was having','Past continuous'],
      ['m-en-008',1,'Choose the best advice: “I am very tired.”',['You should get some rest.','You must to run.','You should resting.','You can tired.'],'You should get some rest.','Modals'],
      ['m-en-009',1,'Complete: You ___ use your phone during the exam.',['mustn’t','don’t must','must to not','not must'],'mustn’t','Rules'],
      ['m-en-010',1,'Complete: You ___ bring a pencil; I have an extra one.',['don’t have to','mustn’t','can’t to','shouldn’t to'],'don’t have to','Obligation'],
      ['m-en-011',1,'Choose the comparative: “This level is ___ than the previous one.”',['harder','hardest','more hard','hard'],'harder','Comparatives'],
      ['m-en-012',1,'Choose the superlative: “This is the ___ route.”',['shortest','shorter','most short','short'],'shortest','Superlatives'],
      ['m-en-013',1,'Complete: There are ___ people in the queue today.',['a lot of','much','any much','a little'],'a lot of','Quantifiers'],
      ['m-en-014',1,'Complete: We have only ___ time left.',['a little','a few','many','several of'],'a little','Quantifiers'],
      ['m-en-015',1,'Choose the best response: “Could I borrow your charger?”',['Sure, here you are.','I borrow it.','At five.','It is charger.'],'Sure, here you are.','Communication'],
      ['m-en-016',1,'Choose the best phrase to disagree politely.',['I see your point, but I disagree.','You are wrong.','No. End of story.','That is stupid.'],'I see your point, but I disagree.','Communication'],
      ['m-en-017',1,'Complete: I’m interested ___ photography.',['in','on','at','for'],'in','Prepositions'],
      ['m-en-018',1,'Complete: She is good ___ drawing.',['at','in','on','to'],'at','Prepositions'],
      ['m-en-019',1,'Choose the correct question tag-like response: “You’re coming, ___?”',['aren’t you','don’t you','isn’t it','weren’t you'],'aren’t you','Question forms'],
      ['m-en-020',1,'What does “deadline” mean?',['the final time to finish something','a free day','a school subject','a transport ticket'],'the final time to finish something','Vocabulary'],

      ['m-en-021',2,'Choose: I ___ this game for two months.',['have played','played yesterday','am play','have play'],'have played','Present perfect'],
      ['m-en-022',2,'Choose: We ___ that film last Saturday.',['watched','have watched last Saturday','watching','have watch'],'watched','Past simple vs present perfect'],
      ['m-en-023',2,'Complete: She has ___ finished her homework.',['just','yesterday','last week','ago'],'just','Present perfect'],
      ['m-en-024',2,'Complete: Have you ___ been to London?',['ever','ago','last','yesterday'],'ever','Present perfect'],
      ['m-en-025',2,'Choose: I haven’t finished ___.',['yet','ago','last night','yesterday'],'yet','Present perfect'],
      ['m-en-026',2,'Complete: If it rains, we ___ indoors.',['will stay','stayed','stay yesterday','would stayed'],'will stay','First conditional'],
      ['m-en-027',2,'Complete: If you heat ice, it ___.',['melts','will melted','melted always','is melt'],'melts','Zero conditional'],
      ['m-en-028',2,'Choose the best future plan.',['I’m going to study tonight.','I going study tonight.','I am study tonight.','I studied tonight tomorrow.'],'I’m going to study tonight.','Future'],
      ['m-en-029',2,'Choose the spontaneous decision: “The phone is ringing.”',['I’ll answer it.','I answered it tomorrow.','I’m answer it.','I answer yesterday.'],'I’ll answer it.','Will'],
      ['m-en-030',2,'Complete: This photo ___ by my sister.',['was taken','took','was take','is taking yesterday'],'was taken','Passive'],
      ['m-en-031',2,'Choose the relative pronoun: “The friend ___ helped me was Ana.”',['who','where','which place','when'],'who','Relative clauses'],
      ['m-en-032',2,'Choose: “This is the app ___ I use for notes.”',['that','who person','where person','when person'],'that','Relative clauses'],
      ['m-en-033',2,'Choose the connector for contrast.',['however','therefore','because of this','for example only'],'however','Connectors'],
      ['m-en-034',2,'Choose the connector for result.',['therefore','although','while','instead of because'],'therefore','Connectors'],
      ['m-en-035',2,'Read: “Maya muted the group chat while studying. She checked it after finishing.” Why did she mute it?',['To reduce distractions.','To leave the group forever.','Because her phone was broken.','To delete her homework.'],'To reduce distractions.','Reading'],
      ['m-en-036',2,'Read: “The team lost, but their passing accuracy improved.” What can we infer?',['Performance can improve even without winning.','They played worse in every way.','The score is the only useful measure.','They did not pass the ball.'],'Performance can improve even without winning.','Reading'],
      ['m-en-037',2,'Choose the best summary: “A school opened a quiet room for reading at lunchtime. Students began using it regularly.”',['A quiet reading space became useful to students.','Lunch was cancelled.','Students stopped reading.','The school removed the library.'],'A quiet reading space became useful to students.','Reading'],
      ['m-en-038',2,'Choose the most polite email opening.',['Hello Ms Brown, I’m writing to ask about the project.','Hey! Project???','Send project info.','Yo teacher.'],'Hello Ms Brown, I’m writing to ask about the project.','Register'],
      ['m-en-039',2,'Choose the best ending for a school email.',['Thank you for your help. Best wishes,','Bye lol','Answer me now.','That’s all!!!'],'Thank you for your help. Best wishes,','Register'],
      ['m-en-040',2,'What does “reliable source” mean?',['a source you can reasonably trust','a source with the brightest colours','the first result online','a message from any stranger'],'a source you can reasonably trust','Digital literacy'],

      ['m-en-041',3,'Choose: By the time we arrived, the match ___.',['had started','has started tomorrow','starts yesterday','is start'],'had started','Past perfect intro'],
      ['m-en-042',3,'Choose the correct reported idea: Tom said, “I am tired.”',['Tom said that he was tired.','Tom said he tired.','Tom says yesterday I am tired.','Tom said that I tired.'],'Tom said that he was tired.','Reported speech'],
      ['m-en-043',3,'Choose: If I had more free time, I ___ a new hobby.',['would start','will started','start yesterday','would started'],'would start','Second conditional intro'],
      ['m-en-044',3,'Choose the best phrase for uncertainty.',['It might be true, but I’m not sure.','It is definitely true because I saw one post.','Everyone knows it.','No evidence is needed.'],'It might be true, but I’m not sure.','Communication'],
      ['m-en-045',3,'Choose the best way to clarify meaning.',['Do you mean that the deadline has changed?','You are confusing.','Whatever.','I know what you mean without asking.'],'Do you mean that the deadline has changed?','Communication'],
      ['m-en-046',3,'Choose the sentence that gives a reasoned opinion.',['I prefer the second option because it is cheaper and faster.','The second option is just better.','Everyone likes the second option.','No reason is necessary.'],'I prefer the second option because it is cheaper and faster.','Argumentation'],
      ['m-en-047',3,'Choose the best paraphrase of “The update was delayed due to technical problems.”',['Technical problems caused the update to be late.','The update was early.','There were no technical problems.','The update caused the internet.'],'Technical problems caused the update to be late.','Mediation'],
      ['m-en-048',3,'Choose the best response when you need thinking time.',['Let me think about that for a moment.','I don’t answer.','Wait because yes.','No idea forever.'],'Let me think about that for a moment.','Interaction'],
      ['m-en-049',3,'Read: “The video had millions of views, but the claim in it had no source.” Which is the best conclusion?',['Popularity does not prove accuracy.','Millions of views make a claim true.','Sources are unnecessary online.','Viral videos are always false.'],'Popularity does not prove accuracy.','Critical reading'],
      ['m-en-050',3,'Read: “Alex used an AI tool to suggest ideas, then checked facts and rewrote the text.” What was Alex doing?',['Using the tool while keeping responsibility for the final work.','Copying without checking.','Avoiding all technology.','Letting the tool submit the work automatically.'],'Using the tool while keeping responsibility for the final work.','AI literacy'],
      ['m-en-051',3,'Choose the sentence with correct punctuation.',['Although it was late, we finished the task.','Although it was late we, finished the task.','Although, it was late we finished the task.','Although it was late we finished, the task.'],'Although it was late, we finished the task.','Writing'],
      ['m-en-052',3,'Choose the best topic sentence for a paragraph about screen-time balance.',['Small habits can make screen time easier to manage.','My phone is black.','Yesterday was Tuesday.','Some apps have blue icons.'],'Small habits can make screen time easier to manage.','Writing'],
      ['m-en-053',3,'Choose the strongest evidence for “The club became more popular.”',['Membership rose from 18 to 42 students.','I think people liked it.','The poster looked nice.','Someone said “cool”.'],'Membership rose from 18 to 42 students.','Evidence'],
      ['m-en-054',3,'Choose the best conclusion after comparing two sources that disagree.',['Check their evidence, date and purpose before deciding.','Choose the one with more followers.','Choose the shortest one.','Assume both are equally accurate.'],'Check their evidence, date and purpose before deciding.','Critical reading']
    ];
    rows.forEach(r=>x.push(q(r[0],r[1],r[2],r[3],r[4],{topic:r[5]})));
    x.push(self('m-en-055',3,'Write a 4-sentence message to organise a group project. Include a suggestion and a question.','Example: Hi everyone. I think we should divide the slides today. I can do the introduction. Which part would you like to do?','Writing'));
    x.push(self('m-en-056',3,'Write a short review of a game, series or book. Give one positive point and one limitation.','Example: The game is creative and easy to start, but some levels feel repetitive. I would recommend it to people who enjoy building.','Writing'));
    x.push(self('m-en-057',3,'Write 4-5 sentences about a time a plan changed unexpectedly. Use past simple and past continuous.','Example: I was waiting for the bus when it started to rain. The bus was delayed, so I called home and changed my plan.','Writing'));
    x.push(self('m-en-058',3,'Write a polite disagreement with this statement: “Phones should be banned everywhere at school.”','Example: I understand the concern, but I do not think phones need to be banned everywhere. They can be useful in some supervised activities.','Writing'));
    x.push(self('m-en-059',3,'Explain in English how to check whether an online claim is reliable.','Example: I would check the source, the date and whether other reliable sources report the same information.','Mediation'));
    x.push(self('m-en-060',3,'Write a short email asking a teacher for clarification about an assignment.','Example: Hello Mr Lee, I’m writing to ask whether the presentation should be individual or in pairs. Thank you for your help. Best wishes, Alex.','Writing'));
    return x;
  }

  function teenEnglish(){
    const x=[];
    const rows=[
      ['t-en-001',1,'Choose the most natural sentence.',['I’ve known her for three years.','I know her since three years.','I knew her for three years until now.','I am knowing her for three years.'],'I’ve known her for three years.','Present perfect'],
      ['t-en-002',1,'Choose: I ___ the message yesterday, but I haven’t replied yet.',['saw','have seen yesterday','see','am seeing'],'saw','Past vs present perfect'],
      ['t-en-003',1,'Complete: We have lived here ___ 2022.',['since','for','during of','from since'],'since','For / since'],
      ['t-en-004',1,'Complete: She has been studying ___ two hours.',['for','since','ago','last'],'for','For / since'],
      ['t-en-005',1,'Choose the best advice.',['You should talk to them directly before assuming what they meant.','You must assume the worst.','You should to post about it.','You had better to ignore every issue.'],'You should talk to them directly before assuming what they meant.','Modals'],
      ['t-en-006',1,'Choose the correct obligation.',['Students have to submit the form by Friday.','Students have submit the form by Friday.','Students must to submitting it.','Students are have to submit.'],'Students have to submit the form by Friday.','Obligation'],
      ['t-en-007',1,'Choose the best possibility phrase.',['It might be a misunderstanding.','It must to be a misunderstanding maybe.','It is maybe must.','It might is a misunderstanding.'],'It might be a misunderstanding.','Modals'],
      ['t-en-008',1,'Complete: If I finish early, I ___ you.',['will call','would called','called tomorrow','will calling'],'will call','First conditional'],
      ['t-en-009',1,'Complete: If I were you, I ___ screenshots without permission.',['wouldn’t share','won’t shared','didn’t sharing','wouldn’t shared'],'wouldn’t share','Second conditional'],
      ['t-en-010',1,'Choose the passive sentence.',['The account was created last year.','They created the account last year.','The account created itself.','Creating the account last year.'],'The account was created last year.','Passive'],
      ['t-en-011',1,'Choose the correct relative clause.',['The person who sent the message apologised.','The person which sent the message apologised.','The person where sent it.','The person when sent it.'],'The person who sent the message apologised.','Relative clauses'],
      ['t-en-012',1,'Choose the best connector for contrast.',['nevertheless','therefore','as a result','for this reason'],'nevertheless','Connectors'],
      ['t-en-013',1,'Choose the best connector for consequence.',['as a result','whereas','despite','although'],'as a result','Connectors'],
      ['t-en-014',1,'Choose the most appropriate formal request.',['Could you please confirm whether the deadline has changed?','Tell me the deadline now.','What’s the deadline lol?','Deadline?'],'Could you please confirm whether the deadline has changed?','Register'],
      ['t-en-015',1,'Choose the most appropriate informal message to a friend.',['Hey, are we still meeting at six?','Dear Sir or Madam, please confirm our social appointment.','I hereby request confirmation.','To whom it may concern...'],'Hey, are we still meeting at six?','Register'],
      ['t-en-016',1,'What does “privacy settings” refer to?',['controls that affect who can see or access information','the brightness of a screen','the cost of a phone','a list of passwords to share'],'controls that affect who can see or access information','Digital vocabulary'],
      ['t-en-017',1,'What does “misleading” mean?',['likely to give a false or incorrect impression','extremely entertaining','very short','private and encrypted'],'likely to give a false or incorrect impression','Vocabulary'],
      ['t-en-018',1,'Choose the best paraphrase of “The post went viral.”',['The post spread very quickly online.','The post was deleted immediately.','The post was private.','The post contained a computer virus.'],'The post spread very quickly online.','Vocabulary'],
      ['t-en-019',1,'Choose the sentence that expresses a balanced opinion.',['There are benefits, but there are also risks to consider.','This is perfect and has no disadvantages.','Anyone who disagrees is wrong.','There is only one possible view.'],'There are benefits, but there are also risks to consider.','Argumentation'],
      ['t-en-020',1,'Choose the best clarification question.',['When you say “later”, do you mean today or another day?','Why are you always vague?','Whatever, I know.','Say it better.'],'When you say “later”, do you mean today or another day?','Interaction'],

      ['t-en-021',2,'Choose: By the time I checked the group chat, they ___.',['had already decided','already decide','have already decide yesterday','were decide'],'had already decided','Past perfect'],
      ['t-en-022',2,'Choose the reported speech: “I can’t come,” Maya said.',['Maya said that she couldn’t come.','Maya said she can’t came.','Maya said I cannot come.','Maya says yesterday she couldn’t came.'],'Maya said that she couldn’t come.','Reported speech'],
      ['t-en-023',2,'Choose the reported question: “Where are you?”',['He asked me where I was.','He asked me where was I.','He asked where are you.','He ask me where I am yesterday.'],'He asked me where I was.','Reported questions'],
      ['t-en-024',2,'Choose: If they had checked the source, they ___ the false claim.',['might not have shared','will not shared','would not share yesterday','had not share'],'might not have shared','Third conditional intro'],
      ['t-en-025',2,'Choose the best deduction: “Her phone is off and she has an exam.”',['She might be concentrating on the exam.','She definitely hates everyone.','She must be angry with me.','There is only one explanation.'],'She might be concentrating on the exam.','Modals of deduction'],
      ['t-en-026',2,'Choose the correct passive: “People share millions of videos every day.”',['Millions of videos are shared every day.','Millions of videos shared every day.','Millions are share videos.','Every day is sharing millions videos.'],'Millions of videos are shared every day.','Passive'],
      ['t-en-027',2,'Choose the best sentence with “despite”.',['Despite the delay, the event started successfully.','Despite it was delayed, the event started.','Despite of the delay, it started.','Despite the event was delay.'],'Despite the delay, the event started successfully.','Connectors'],
      ['t-en-028',2,'Choose the best sentence with “although”.',['Although the clip was short, it needed context.','Although of the short clip, context.','Although the clip short.','Although despite the clip.'],'Although the clip was short, it needed context.','Connectors'],
      ['t-en-029',2,'Read: “A creator corrected an error publicly and linked the original data.” What does this suggest?',['They were trying to be transparent about the mistake.','They wanted to hide the mistake.','The data were unnecessary.','Corrections always make a source unreliable.'],'They were trying to be transparent about the mistake.','Critical reading'],
      ['t-en-030',2,'Read: “Two articles report different numbers because one uses data from 2023 and the other from 2026.” What should you check first?',['Whether the dates explain the difference.','Which headline is more dramatic.','Which page has more ads.','Which one is shorter.'],'Whether the dates explain the difference.','Critical reading'],
      ['t-en-031',2,'Choose the strongest evidence for “Students used the library more after the change.”',['Weekly visits rose from 120 to 205.','Some students said it looked nicer.','The chairs were blue.','The librarian posted a photo.'],'Weekly visits rose from 120 to 205.','Evidence'],
      ['t-en-032',2,'Choose the most cautious conclusion from a poll of 25 classmates.',['The poll shows what these classmates reported; it may not represent all teenagers.','All teenagers think the same.','The result proves a universal fact.','No limitations need to be mentioned.'],'The poll shows what these classmates reported; it may not represent all teenagers.','Evidence'],
      ['t-en-033',2,'Choose the best way to disagree in a discussion.',['I understand your point; my concern is the effect on privacy.','That makes no sense.','You clearly know nothing.','I refuse to explain.'],'I understand your point; my concern is the effect on privacy.','Interaction'],
      ['t-en-034',2,'Choose the best way to set a boundary.',['I’m not comfortable sharing my password.','If you cared, you would know my password.','Take it; it doesn’t matter.','I will share it with everyone.'],'I’m not comfortable sharing my password.','Communication'],
      ['t-en-035',2,'Choose the best summary of a balanced article about AI in school.',['AI can support some tasks, but accuracy, learning and responsible use still matter.','AI solves every school problem.','AI should never be used for anything.','Only speed matters.'],'AI can support some tasks, but accuracy, learning and responsible use still matter.','Summary'],
      ['t-en-036',2,'Choose the best paraphrase: “The author questions whether popularity should be treated as evidence.”',['The author doubts that popularity proves a claim is true.','The author says popular claims are always true.','The author only discusses advertising.','The author dislikes all popular content.'],'The author doubts that popularity proves a claim is true.','Paraphrase'],
      ['t-en-037',2,'Choose the sentence with the most precise language.',['Three of the five examples contained the same error.','Everything was wrong.','It was always terrible.','Nobody understood anything.'],'Three of the five examples contained the same error.','Precision'],
      ['t-en-038',2,'Choose the best hedge for an uncertain claim.',['The results suggest that...','The results prove forever that...','Obviously everyone knows...','There can be no other explanation.'],'The results suggest that...','Academic language'],
      ['t-en-039',2,'Choose the best topic sentence.',['Online popularity and reliability are not the same thing.','I opened an app yesterday.','My screen is six inches.','Some icons are round.'],'Online popularity and reliability are not the same thing.','Writing'],
      ['t-en-040',2,'Choose the best concluding sentence.',['Overall, the evidence supports a cautious rather than absolute conclusion.','That is all because yes.','Everybody must agree now.','There are no limitations.'],'Overall, the evidence supports a cautious rather than absolute conclusion.','Writing'],

      ['t-en-041',3,'Choose: If the image ___ edited, the metadata may help us check it.',['has been','has be','was been always','is been'],'has been','Passive / perfect'],
      ['t-en-042',3,'Choose the best sentence.',['The claim, which was posted without a source, spread quickly.','The claim which without source was spread quickly it.','The claim, who was posted, spread.','The claim where posted spread quickly.'],'The claim, which was posted without a source, spread quickly.','Relative clauses'],
      ['t-en-043',3,'Choose the best formal alternative to “a lot of people think”.',['A substantial number of respondents reported that...','Loads of people reckon...','Everyone definitely thinks...','People, you know, think...'],'A substantial number of respondents reported that...','Register'],
      ['t-en-044',3,'Choose the best way to acknowledge a counterargument.',['While this concern is valid, the evidence also shows...','The other side is stupid.','There is no reason to mention other views.','Everyone agrees with me.'],'While this concern is valid, the evidence also shows...','Argumentation'],
      ['t-en-045',3,'Choose the best synthesis of two sources.',['Both sources identify benefits, but they differ on how serious the risks are.','The sources say exactly the same thing even though they disagree.','One source must be ignored.','Two sources cannot be compared.'],'Both sources identify benefits, but they differ on how serious the risks are.','Synthesis'],
      ['t-en-046',3,'Choose the best evaluation of a source.',['It is recent and transparent about its method, but the sample is small.','It has a modern logo, so it is reliable.','It has many comments, so it is accurate.','It agrees with me, so it is trustworthy.'],'It is recent and transparent about its method, but the sample is small.','Critical literacy'],
      ['t-en-047',3,'Choose the best phrase to reformulate your point.',['What I mean is that the rule should be flexible, not removed.','I mean what I said, obviously.','Never mind.','You should already understand.'],'What I mean is that the rule should be flexible, not removed.','Interaction'],
      ['t-en-048',3,'Choose the best mediation sentence.',['In simple terms, the report says the change helped some students but not all.','The report is complicated, so ignore it.','The report says stuff.','I cannot explain anything.'],'In simple terms, the report says the change helped some students but not all.','Mediation'],
      ['t-en-049',3,'Read: “An AI answer included a confident statistic but no source.” What is the best next step?',['Verify the statistic with reliable sources before using it.','Use it because it sounds confident.','Add a random link.','Assume numbers are always accurate.'],'Verify the statistic with reliable sources before using it.','AI literacy'],
      ['t-en-050',3,'Read: “A viral clip starts halfway through an argument.” What limitation matters most?',['Missing context may change how the interaction is interpreted.','The clip is too popular.','Short clips are always fake.','Arguments never need context.'],'Missing context may change how the interaction is interpreted.','Critical literacy'],
      ['t-en-051',3,'Choose the clearest sentence.',['After reviewing the evidence, I changed my initial opinion.','After evidence reviewing my opinion initially changed by me.','I changed, evidence, opinion.','Reviewing was opinion changed.'],'After reviewing the evidence, I changed my initial opinion.','Writing'],
      ['t-en-052',3,'Choose the best phrase for a limitation.',['One limitation of this conclusion is that...','This conclusion has no possible limits.','The evidence is perfect.','No caution is needed.'],'One limitation of this conclusion is that...','Academic writing']
    ];
    rows.forEach(r=>x.push(q(r[0],r[1],r[2],r[3],r[4],{topic:r[5]})));
    x.push(self('t-en-053',3,'Write a 5-sentence opinion on whether schools should teach AI literacy. Include a reason, an example and a limitation.','Example structure: opinion → reason → example → counterpoint/limitation → conclusion.','Writing'));
    x.push(self('t-en-054',3,'Write a polite message setting a digital boundary with a friend or partner.','Example: I’m happy to tell you when I arrive, but I don’t want to share my live location all the time.','Communication'));
    x.push(self('t-en-055',3,'Summarise in 3 sentences how you would check a viral claim before sharing it.','Example: I would identify the original source, check the date and compare the claim with reliable independent sources.','Mediation'));
    x.push(self('t-en-056',3,'Write a short paragraph comparing two ways of studying: alone and with friends.','Example: Studying alone can make concentration easier, whereas studying with friends can help when discussing difficult ideas. The best option depends on the task.','Writing'));
    x.push(self('t-en-057',3,'Write a short response to someone who disagrees with you online. Keep it firm and respectful.','Example: I see why you read it that way. I disagree because the data in the article point to a different conclusion.','Interaction'));
    x.push(self('t-en-058',3,'Explain in English the difference between a fact, an opinion and an interpretation.','Example: A fact can be checked; an opinion expresses a judgement; an interpretation explains what someone thinks events mean.','Mediation'));
    x.push(self('t-en-059',3,'Write a 5-sentence review of a game, app, film or series without using “good”, “bad” or “nice”.','Example: Focus on specific strengths, weaknesses, audience and evidence for your judgement.','Writing'));
    x.push(self('t-en-060',3,'Write a short email asking for more time on a task. Give a reason without oversharing and propose a realistic new deadline.','Example: Hello Ms Green, I’m writing to ask whether I could submit the task on Thursday instead of Tuesday because I have two assessments this week. I can have the final version ready by Thursday afternoon.','Writing'));
    return x;
  }

  const banks={primary:primaryEnglish(),middle:middleEnglish(),teen:teenEnglish()};
  Object.entries(banks).forEach(([band,bank])=>{if(D[band]){D[band].english=bank;if(!D[band].subjects.includes('english'))D[band].subjects.push('english');}});
})();
