MATCH (coreValue:CoreValue)<-[:EMBRACES]-(member:Member) WHERE coreValue.description IS NOT NULL RETURN member.firstName + ' ' + member.lastName AS name, elementId(member) AS _id, member.avatar AS avatar, coreValue.description AS coreValueDescription, coreValue.whoSupports AS supportedBy, coreValue.alignmentChallenges AS challenges, coreValue.alignmentExamples AS examples LIMIT 10;
WHERE toLower(trim(coreValue.name)) CONTAINS toLower(trim('vulnerability'))
RETURN coreValue
//