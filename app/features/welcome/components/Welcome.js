// @flow

// import Button from '@atlaskit/button';
import { FieldTextStateless } from '@atlaskit/field-text';
import { SpotlightTarget } from '@atlaskit/onboarding';
import Page from '@atlaskit/page';
import { AtlasKitThemeProvider } from '@atlaskit/theme';

import { generateRoomWithoutSeparator } from 'js-utils/random';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Navbar } from '../../navbar';
import { Onboarding, startOnboarding } from '../../onboarding';
import { createConferenceObjectFromURL } from '../../utils';

import { Body, FieldWrapper, Form, Header, Label, Wrapper } from '../styled';

type Props = {

    /**
     * Redux dispatch.
     */
    dispatch: Dispatch<*>;

    /**
     * React Router location object.
     */
    location: Object;

    /**
     * I18next translate function.
     */
     t: Function;
};

type State = {

    /**
     * Timer for animating the room name geneeration.
     */
    animateTimeoutId: ?TimeoutID,

    /**
     * Timer for re-generating a new room name.
     */
    updateTimeoutId: ?TimeoutID,

    /**
     * URL of the room to join.
     * If this is not a url it will be treated as room name for default domain.
     */
    url: string;
};

/**
 * Welcome Component.
 */
class Welcome extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        // Initialize url value in state if passed using location state object.
        let url = '';

        // Check and parse url if exists in location state.
        if (props.location.state) {
            const { room, serverURL } = props.location.state;

            if (room && serverURL) {
                url = `${serverURL}/${room}`;
            }
        }

        this.state = {
            animateTimeoutId: undefined,
            updateTimeoutId: undefined,
            url,
            password: ''
        };

        // Bind event handlers.
        this._onURLChange = this._onURLChange.bind(this);
        this._onPasswordChange = this._onPasswordChange.bind(this);
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this._onJoin = this._onJoin.bind(this);
    }

    /**
     * Start Onboarding once component is mounted.
     * Start generating randdom room names.
     *
     * NOTE: It autonatically checks if the onboarding is shown or not.
     *
     * @returns {void}
     */
    componentDidMount() {
        this.props.dispatch(startOnboarding('welcome-page'));
    }

    /**
     * Stop all timers when unmounting.
     *
     * @returns {voidd}
     */
    componentWillUnmount() {
        this._clearTimeouts();
    }

    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            <Page navigation = { <Navbar /> }>
                <AtlasKitThemeProvider mode = 'light'>
                    <Wrapper
                        style = {{
                            backgroundImage: 'url(https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'grayscale(0.6)'
                        }}>
                        { this._renderHeader() }
                        { this._renderBody() }
                        <Onboarding section = 'welcome-page' />
                    </Wrapper>
                </AtlasKitThemeProvider>
            </Page>
        );
    }

    /**
     * Method that clears timeouts for animations and updates of room name.
     *
     * @private
     * @returns {void}
     */
    _clearTimeouts() {
        clearTimeout(this.state.animateTimeoutId);
        clearTimeout(this.state.updateTimeoutId);
    }

    _onFormSubmit: (*) => void;

    /**
     * Prevents submission of the form and delegates the join logic.
     *
     * @param {Event} event - Event by which this function is called.
     * @returns {void}
     */
    _onFormSubmit(event: Event) {
        event.preventDefault();
        this._onJoin();
    }

    _onJoin: (*) => void;

    /**
     * Redirect and join conference.
     *
     * @returns {void}
     */
    _onJoin() {
        const inputURL = this.state.url;
        const password = this.state.password;

        if (inputURL.length < 0 && password.length < 0) {
            console.log('Provide room details');

            return;
        }

        const conference = createConferenceObjectFromURL(inputURL, password);

        // Don't navigate if conference couldn't be created
        if (!conference) {
            return;
        }

        this.props.dispatch(push('/conference', conference));
    }

    _onURLChange: (*) => void;

    /**
     * Keeps URL input value and URL in state in sync.
     *
     * @param {SyntheticInputEvent<HTMLInputElement>} event - Event by which
     * this function is called.
     * @returns {void}
     */
    _onURLChange(event: SyntheticInputEvent<HTMLInputElement>) {
        this.setState({
            url: event.currentTarget.value
        });
    }

    _onPasswordChange: (*) => void;

    /**
     * Keeps URL input value and URL in state in sync.
     *
     * @param {SyntheticInputEvent<HTMLInputElement>} event - Event by which
     * this function is called.
     * @returns {void}
     */
    _onPasswordChange(event: SyntheticInputEvent<HTMLInputElement>) {
        this.setState({
            password: event.currentTarget.value
        });
    }

    /**
     * Renders the body for the welcome page.
     *
     * @returns {ReactElement}
     */
    _renderBody() {
        return (
            <Body />
        );
    }

    /**
     * Renders the header for the welcome page.
     *
     * @returns {ReactElement}
     */
    _renderHeader() {
        const locationState = this.props.location.state;
        const locationError = locationState && locationState.error;
        const { t } = this.props;

        return (
            <Header>
                <SpotlightTarget name = 'conference-url'>
                    <Form
                        onSubmit = { this._onFormSubmit }
                        style = {{ backgroundColor: 'white',
                            padding: 10 }}>
                        <div
                            style = {{ width: '100%',
                                textAlign: 'center' }}>
                            <img
                                height = { 50 }
                                src = 'https://prisma.ch/wp-content/uploads/2016/05/header-logo.png'
                                style = {{ textAlign: 'center' }} />
                        </div>

                        <FieldWrapper
                            style = {{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'stretch'
                            }}>
                            <Label style = {{ color: '#2d3748' }}>Meetingname</Label>

                            <FieldTextStateless
                                autoFocus = { true }
                                isInvalid = { locationError }
                                isLabelHidden = { true }
                                onChange = { this._onURLChange }
                                placeholder = { this.state.roomPlaceholder }
                                shouldFitContainer = { true }
                                type = 'text'
                                value = { this.state.url } />
                                
                            <Label
                                style = {{
                                    marginTop: 20,
                                    color: '#2d3748'
                                }}>Passwort</Label>

                            <FieldTextStateless
                                autoFocus = { false }
                                isInvalid = { locationError }
                                isLabelHidden = { true }
                                onChange = { this._onPasswordChange }
                                shouldFitContainer = { true }
                                type = 'text'
                                value = { this.state.password } />

                            <button
                                onClick = { this._onJoin }
                                style = {{
                                    marginTop: 20,
                                    textAlign: 'center',
                                    padding: 10,
                                    backgroundColor: '#d69e2e',
                                    color: 'white',
                                    borderRadius: '.25rem',
                                    border: 'none'
                                }}
                                type = 'button'>
                                { t('go') }
                            </button>
                        </FieldWrapper>
                    </Form>
                </SpotlightTarget>
            </Header>
        );
    }
}

export default compose(connect(), withTranslation())(Welcome);
