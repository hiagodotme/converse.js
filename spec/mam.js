(function (root, factory) {
    define(["mock", "converse-api", "test_utils"], factory);
} (this, function (mock, converse_api, test_utils) {
    "use strict";
    var _ = converse_api.env._;
    var $ = converse_api.env.jQuery;
    var Strophe = converse_api.env.Strophe;
    var $iq = converse_api.env.$iq;
    var $msg = converse_api.env.$msg;
    var moment = converse_api.env.moment;
    // See: https://xmpp.org/rfcs/rfc3921.html

    describe("Message Archive Management", function () {
        // Implement the protocol defined in https://xmpp.org/extensions/xep-0313.html#config

        describe("The archive.query API", function () {

           it("can be used to query for all archived messages", mock.initConverse(function (converse) {
                var sent_stanza, IQ_id;
                var sendIQ = converse.connection.sendIQ;
                spyOn(converse.connection, 'sendIQ').andCallFake(function (iq, callback, errback) {
                    sent_stanza = iq;
                    IQ_id = sendIQ.bind(this)(iq, callback, errback);
                });
                if (!converse.features.findWhere({'var': Strophe.NS.MAM})) {
                    converse.features.create({'var': Strophe.NS.MAM});
                }
                converse.api.archive.query();
                var queryid = $(sent_stanza.toString()).find('query').attr('queryid');
                expect(sent_stanza.toString()).toBe(
                    "<iq type='set' xmlns='jabber:client' id='"+IQ_id+"'><query xmlns='urn:xmpp:mam:0' queryid='"+queryid+"'/></iq>");
            }));

           it("can be used to query for all messages to/from a particular JID", mock.initConverse(function (converse) {
                var sent_stanza, IQ_id;
                var sendIQ = converse.connection.sendIQ;
                spyOn(converse.connection, 'sendIQ').andCallFake(function (iq, callback, errback) {
                    sent_stanza = iq;
                    IQ_id = sendIQ.bind(this)(iq, callback, errback);
                });
                if (!converse.features.findWhere({'var': Strophe.NS.MAM})) {
                    converse.features.create({'var': Strophe.NS.MAM});
                }
                converse.api.archive.query({'with':'juliet@capulet.lit'});
                var queryid = $(sent_stanza.toString()).find('query').attr('queryid');
                expect(sent_stanza.toString()).toBe(
                    "<iq type='set' xmlns='jabber:client' id='"+IQ_id+"'>"+
                        "<query xmlns='urn:xmpp:mam:0' queryid='"+queryid+"'>"+
                            "<x xmlns='jabber:x:data' type='submit'>"+
                            "<field var='FORM_TYPE' type='hidden'>"+
                                "<value>urn:xmpp:mam:0</value>"+
                            "</field>"+
                            "<field var='with'>"+
                                "<value>juliet@capulet.lit</value>"+
                            "</field>"+
                            "</x>"+
                        "</query>"+
                    "</iq>"
                );
            }));

           it("can be used to query for all messages in a certain timespan", mock.initConverse(function (converse) {
                var sent_stanza, IQ_id;
                var sendIQ = converse.connection.sendIQ;
                spyOn(converse.connection, 'sendIQ').andCallFake(function (iq, callback, errback) {
                    sent_stanza = iq;
                    IQ_id = sendIQ.bind(this)(iq, callback, errback);
                });
                if (!converse.features.findWhere({'var': Strophe.NS.MAM})) {
                    converse.features.create({'var': Strophe.NS.MAM});
                }
                var start = '2010-06-07T00:00:00Z';
                var end = '2010-07-07T13:23:54Z';
                converse.api.archive.query({
                    'start': start,
                    'end': end

                });
                var queryid = $(sent_stanza.toString()).find('query').attr('queryid');
                expect(sent_stanza.toString()).toBe(
                    "<iq type='set' xmlns='jabber:client' id='"+IQ_id+"'>"+
                        "<query xmlns='urn:xmpp:mam:0' queryid='"+queryid+"'>"+
                            "<x xmlns='jabber:x:data' type='submit'>"+
                            "<field var='FORM_TYPE' type='hidden'>"+
                                "<value>urn:xmpp:mam:0</value>"+
                            "</field>"+
                            "<field var='start'>"+
                                "<value>"+moment(start).format()+"</value>"+
                            "</field>"+
                            "<field var='end'>"+
                                "<value>"+moment(end).format()+"</value>"+
                            "</field>"+
                            "</x>"+
                        "</query>"+
                    "</iq>"
                );
           }));

           it("throws a TypeError if an invalid date is provided", mock.initConverse(function (converse) {
                if (!converse.features.findWhere({'var': Strophe.NS.MAM})) {
                    converse.features.create({'var': Strophe.NS.MAM});
                }
                expect(_.partial(converse.api.archive.query, {'start': 'not a real date'})).toThrow(
                    new TypeError('archive.query: invalid date provided for: start')
                );
           }));

           it("can be used to query for all messages after a certain time", mock.initConverse(function (converse) {
                var sent_stanza, IQ_id;
                var sendIQ = converse.connection.sendIQ;
                spyOn(converse.connection, 'sendIQ').andCallFake(function (iq, callback, errback) {
                    sent_stanza = iq;
                    IQ_id = sendIQ.bind(this)(iq, callback, errback);
                });
                if (!converse.features.findWhere({'var': Strophe.NS.MAM})) {
                    converse.features.create({'var': Strophe.NS.MAM});
                }
                var start = '2010-06-07T00:00:00Z';
                converse.api.archive.query({'start': start});
                var queryid = $(sent_stanza.toString()).find('query').attr('queryid');
                expect(sent_stanza.toString()).toBe(
                    "<iq type='set' xmlns='jabber:client' id='"+IQ_id+"'>"+
                        "<query xmlns='urn:xmpp:mam:0' queryid='"+queryid+"'>"+
                            "<x xmlns='jabber:x:data' type='submit'>"+
                            "<field var='FORM_TYPE' type='hidden'>"+
                                "<value>urn:xmpp:mam:0</value>"+
                            "</field>"+
                            "<field var='start'>"+
                                "<value>"+moment(start).format()+"</value>"+
                            "</field>"+
                            "</x>"+
                        "</query>"+
                    "</iq>"
                );
           }));

           it("can be used to query for a limited set of results", mock.initConverse(function (converse) {
                var sent_stanza, IQ_id;
                var sendIQ = converse.connection.sendIQ;
                spyOn(converse.connection, 'sendIQ').andCallFake(function (iq, callback, errback) {
                    sent_stanza = iq;
                    IQ_id = sendIQ.bind(this)(iq, callback, errback);
                });
                if (!converse.features.findWhere({'var': Strophe.NS.MAM})) {
                    converse.features.create({'var': Strophe.NS.MAM});
                }
                var start = '2010-06-07T00:00:00Z';
                converse.api.archive.query({'start': start, 'max':10});
                var queryid = $(sent_stanza.toString()).find('query').attr('queryid');
                expect(sent_stanza.toString()).toBe(
                    "<iq type='set' xmlns='jabber:client' id='"+IQ_id+"'>"+
                        "<query xmlns='urn:xmpp:mam:0' queryid='"+queryid+"'>"+
                            "<x xmlns='jabber:x:data' type='submit'>"+
                                "<field var='FORM_TYPE' type='hidden'>"+
                                    "<value>urn:xmpp:mam:0</value>"+
                                "</field>"+
                                "<field var='start'>"+
                                    "<value>"+moment(start).format()+"</value>"+
                                "</field>"+
                            "</x>"+
                            "<set xmlns='http://jabber.org/protocol/rsm'>"+
                                "<max>10</max>"+
                            "</set>"+
                        "</query>"+
                    "</iq>"
                );
           }));

           it("can be used to page through results", mock.initConverse(function (converse) {
                var sent_stanza, IQ_id;
                var sendIQ = converse.connection.sendIQ;
                spyOn(converse.connection, 'sendIQ').andCallFake(function (iq, callback, errback) {
                    sent_stanza = iq;
                    IQ_id = sendIQ.bind(this)(iq, callback, errback);
                });
                if (!converse.features.findWhere({'var': Strophe.NS.MAM})) {
                    converse.features.create({'var': Strophe.NS.MAM});
                }
                var start = '2010-06-07T00:00:00Z';
                converse.api.archive.query({
                    'start': start,
                    'after': '09af3-cc343-b409f',
                    'max':10
                });
                var queryid = $(sent_stanza.toString()).find('query').attr('queryid');
                expect(sent_stanza.toString()).toBe(
                    "<iq type='set' xmlns='jabber:client' id='"+IQ_id+"'>"+
                        "<query xmlns='urn:xmpp:mam:0' queryid='"+queryid+"'>"+
                            "<x xmlns='jabber:x:data' type='submit'>"+
                                "<field var='FORM_TYPE' type='hidden'>"+
                                    "<value>urn:xmpp:mam:0</value>"+
                                "</field>"+
                                "<field var='start'>"+
                                    "<value>"+moment(start).format()+"</value>"+
                                "</field>"+
                            "</x>"+
                            "<set xmlns='http://jabber.org/protocol/rsm'>"+
                                "<max>10</max>"+
                                "<after>09af3-cc343-b409f</after>"+
                            "</set>"+
                        "</query>"+
                    "</iq>"
                );
           }));

           it("accepts \"before\" with an empty string as value to reverse the order", mock.initConverse(function (converse) {
                var sent_stanza, IQ_id;
                var sendIQ = converse.connection.sendIQ;
                spyOn(converse.connection, 'sendIQ').andCallFake(function (iq, callback, errback) {
                    sent_stanza = iq;
                    IQ_id = sendIQ.bind(this)(iq, callback, errback);
                });
                if (!converse.features.findWhere({'var': Strophe.NS.MAM})) {
                    converse.features.create({'var': Strophe.NS.MAM});
                }
                converse.api.archive.query({'before': '', 'max':10});
                var queryid = $(sent_stanza.toString()).find('query').attr('queryid');
                expect(sent_stanza.toString()).toBe(
                    "<iq type='set' xmlns='jabber:client' id='"+IQ_id+"'>"+
                        "<query xmlns='urn:xmpp:mam:0' queryid='"+queryid+"'>"+
                            "<x xmlns='jabber:x:data' type='submit'>"+
                                "<field var='FORM_TYPE' type='hidden'>"+
                                    "<value>urn:xmpp:mam:0</value>"+
                                "</field>"+
                            "</x>"+
                            "<set xmlns='http://jabber.org/protocol/rsm'>"+
                                "<max>10</max>"+
                                "<before></before>"+
                            "</set>"+
                        "</query>"+
                    "</iq>"
                );
           }));

           it("accepts a Strophe.RSM object for the query options", mock.initConverse(function (converse) {
                // Normally the user wouldn't manually make a Strophe.RSM object
                // and pass it in. However, in the callback method an RSM object is
                // returned which can be reused for easy paging. This test is
                // more for that usecase.
                if (!converse.features.findWhere({'var': Strophe.NS.MAM})) {
                    converse.features.create({'var': Strophe.NS.MAM});
                }
                var sent_stanza, IQ_id;
                var sendIQ = converse.connection.sendIQ;
                spyOn(converse.connection, 'sendIQ').andCallFake(function (iq, callback, errback) {
                    sent_stanza = iq;
                    IQ_id = sendIQ.bind(this)(iq, callback, errback);
                });
                var rsm =  new Strophe.RSM({'max': '10'});
                rsm['with'] = 'romeo@montague.lit';
                rsm.start = '2010-06-07T00:00:00Z';
                converse.api.archive.query(rsm);

                var queryid = $(sent_stanza.toString()).find('query').attr('queryid');
                expect(sent_stanza.toString()).toBe(
                    "<iq type='set' xmlns='jabber:client' id='"+IQ_id+"'>"+
                        "<query xmlns='urn:xmpp:mam:0' queryid='"+queryid+"'>"+
                            "<x xmlns='jabber:x:data' type='submit'>"+
                                "<field var='FORM_TYPE' type='hidden'>"+
                                    "<value>urn:xmpp:mam:0</value>"+
                                "</field>"+
                                "<field var='with'>"+
                                    "<value>romeo@montague.lit</value>"+
                                "</field>"+
                                "<field var='start'>"+
                                    "<value>"+moment(rsm.start).format()+"</value>"+
                                "</field>"+
                            "</x>"+
                            "<set xmlns='http://jabber.org/protocol/rsm'>"+
                                "<max>10</max>"+
                            "</set>"+
                        "</query>"+
                    "</iq>"
                );
           }));

           it("accepts a callback function, which it passes the messages and a Strophe.RSM object", mock.initConverse(function (converse) {
                if (!converse.features.findWhere({'var': Strophe.NS.MAM})) {
                    converse.features.create({'var': Strophe.NS.MAM});
                }
                var sent_stanza, IQ_id;
                var sendIQ = converse.connection.sendIQ;
                spyOn(converse.connection, 'sendIQ').andCallFake(function (iq, callback, errback) {
                    sent_stanza = iq;
                    IQ_id = sendIQ.bind(this)(iq, callback, errback);
                });
                var callback = jasmine.createSpy('callback');

                converse.api.archive.query({'with': 'romeo@capulet.lit', 'max':'10'}, callback);
                var queryid = $(sent_stanza.toString()).find('query').attr('queryid');

                // Send the result stanza, so that the callback is called.
                var stanza = $iq({'type': 'result', 'id': IQ_id});
                converse.connection._dataRecv(test_utils.createRequest(stanza));

                /* <message id='aeb213' to='juliet@capulet.lit/chamber'>
                 *   <result xmlns='urn:xmpp:mam:0' queryid='f27' id='28482-98726-73623'>
                 *     <forwarded xmlns='urn:xmpp:forward:0'>
                 *       <delay xmlns='urn:xmpp:delay' stamp='2010-07-10T23:08:25Z'/>
                 *       <message
                 *         to='juliet@capulet.lit/balcony'
                 *         from='romeo@montague.lit/orchard'
                 *         type='chat'
                 *         xmlns='jabber:client'>
                 *         <body>Call me but love, and I'll be new baptized; Henceforth I never will be Romeo.</body>
                 *       </message>
                 *     </forwarded>
                 *   </result>
                 * </message>
                 */
                var msg1 = $msg({'id':'aeb213', 'to':'juliet@capulet.lit/chamber'})
                            .c('result',  {'xmlns': 'urn:xmpp:mam:0', 'queryid':queryid, 'id':'28482-98726-73623'})
                                .c('forwarded', {'xmlns':'urn:xmpp:forward:0'})
                                    .c('delay', {'xmlns':'urn:xmpp:delay', 'stamp':'2010-07-10T23:08:25Z'}).up()
                                    .c('message', {
                                        'xmlns':'jabber:client',
                                        'to':'juliet@capulet.lit/balcony',
                                        'from':'romeo@montague.lit/orchard',
                                        'type':'chat' })
                                    .c('body').t("Call me but love, and I'll be new baptized;");
                converse.connection._dataRecv(test_utils.createRequest(msg1));

                var msg2 = $msg({'id':'aeb213', 'to':'juliet@capulet.lit/chamber'})
                            .c('result',  {'xmlns': 'urn:xmpp:mam:0', 'queryid':queryid, 'id':'28482-98726-73624'})
                                .c('forwarded', {'xmlns':'urn:xmpp:forward:0'})
                                    .c('delay', {'xmlns':'urn:xmpp:delay', 'stamp':'2010-07-10T23:08:25Z'}).up()
                                    .c('message', {
                                        'xmlns':'jabber:client',
                                        'to':'juliet@capulet.lit/balcony',
                                        'from':'romeo@montague.lit/orchard',
                                        'type':'chat' })
                                    .c('body').t("Henceforth I never will be Romeo.");
                converse.connection._dataRecv(test_utils.createRequest(msg2));

                /* Send a <fin> message to indicate the end of the result set.
                 *
                 * <message>
                 *     <fin xmlns='urn:xmpp:mam:0' complete='true'>
                 *         <set xmlns='http://jabber.org/protocol/rsm'>
                 *             <first index='0'>23452-4534-1</first>
                 *             <last>390-2342-22</last>
                 *             <count>16</count>
                 *         </set>
                 *     </fin>
                 * </message>
                 */
                stanza = $msg().c('fin', {'xmlns': 'urn:xmpp:mam:0', 'queryid':queryid, 'complete': 'true'})
                            .c('set',  {'xmlns': 'http://jabber.org/protocol/rsm'})
                                .c('first', {'index': '0'}).t('23452-4534-1').up()
                                .c('last').t('390-2342-22').up()
                                .c('count').t('16');
                converse.connection._dataRecv(test_utils.createRequest(stanza));

                expect(callback).toHaveBeenCalled();
                var args = callback.argsForCall[0];
                expect(args[0].length).toBe(2);
                expect(args[0][0].outerHTML).toBe(msg1.nodeTree.outerHTML);
                expect(args[0][1].outerHTML).toBe(msg2.nodeTree.outerHTML);
                expect(args[1]['with']).toBe('romeo@capulet.lit');
                expect(args[1].max).toBe('10');
                expect(args[1].count).toBe('16');
                expect(args[1].first).toBe('23452-4534-1');
                expect(args[1].last).toBe('390-2342-22');
           }));

        });

        describe("The default preference", function () {

            it("is set once server support for MAM has been confirmed", mock.initConverse(function (converse) {
                var sent_stanza, IQ_id;
                var sendIQ = converse.connection.sendIQ;
                spyOn(converse.connection, 'sendIQ').andCallFake(function (iq, callback, errback) {
                    sent_stanza = iq;
                    IQ_id = sendIQ.bind(this)(iq, callback, errback);
                });
                spyOn(converse, 'onMAMPreferences').andCallThrough();

                var feature = new converse.Feature({
                    'var': Strophe.NS.MAM
                });
                spyOn(feature, 'save').andCallFake(feature.set); // Save will complain about a url not being set
                converse.features.onFeatureAdded(feature);

                expect(converse.connection.sendIQ).toHaveBeenCalled();
                expect(sent_stanza.toLocaleString()).toBe(
                    "<iq type='get' xmlns='jabber:client' id='"+IQ_id+"'>"+
                        "<prefs xmlns='urn:xmpp:mam:0'/>"+
                    "</iq>"
                );

                converse.message_archiving = 'never';
                /* Example 15. Server responds with current preferences
                 *
                 * <iq type='result' id='juliet2'>
                 *   <prefs xmlns='urn:xmpp:mam:0' default='roster'>
                 *     <always/>
                 *     <never/>
                 *   </prefs>
                 * </iq>
                 */
                var stanza = $iq({'type': 'result', 'id': IQ_id})
                    .c('prefs', {'xmlns': Strophe.NS.MAM, 'default':'roster'})
                    .c('always').c('jid').t('romeo@montague.lit').up().up()
                    .c('never').c('jid').t('montague@montague.lit');
                converse.connection._dataRecv(test_utils.createRequest(stanza));

                expect(converse.onMAMPreferences).toHaveBeenCalled();

                expect(converse.connection.sendIQ.callCount).toBe(2);
                expect(sent_stanza.toString()).toBe(
                    "<iq type='set' xmlns='jabber:client' id='"+IQ_id+"'>"+
                        "<prefs xmlns='urn:xmpp:mam:0' default='never'>"+
                            "<always><jid>romeo@montague.lit</jid></always>"+
                            "<never><jid>montague@montague.lit</jid></never>"+
                        "</prefs>"+
                    "</iq>"
                );

                expect(feature.get('preference')).toBe(undefined);
                /* <iq type='result' id='juliet3'>
                 *   <prefs xmlns='urn:xmpp:mam:0' default='always'>
                 *       <always>
                 *          <jid>romeo@montague.lit</jid>
                 *       </always>
                 *       <never>
                 *          <jid>montague@montague.lit</jid>
                 *       </never>
                 *   </prefs>
                 * </iq>
                 */
                stanza = $iq({'type': 'result', 'id': IQ_id})
                    .c('prefs', {'xmlns': Strophe.NS.MAM, 'default':'always'})
                    .c('always').up()
                    .c('never').up();
                converse.connection._dataRecv(test_utils.createRequest(stanza));
                expect(feature.save).toHaveBeenCalled();
                expect(feature.get('preferences')['default']).toBe('never');

                // Restore
                converse.message_archiving = 'never';
            }));
        });
    });
}));
