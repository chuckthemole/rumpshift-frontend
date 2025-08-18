import React from 'react';
// import './LandingPageBody.css';

const LandingPageBody = () => {
    return (
        <div className="landing-page-body">
            {/* Hero Section */}
            <section className="hero is-fullheight-with-navbar has-background-white-ter">
                <div className="hero-body">
                    <div className="container has-text-centered">
                        <h1 className="title is-size-1 has-text-weight-bold has-text-danger">
                            BuildShift
                        </h1>
                        <p className="subtitle is-size-4 mt-4">
                            Business tools made real, people made simple
                        </p>
                        <div className="mt-6">
                            <p className="is-size-3 has-text-weight-bold has-text-danger">CALL NOW</p>
                            <p className="is-size-4">we want to BS you</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="section has-background-white-bis">
                <div className="container">
                    <h2 className="title is-size-2 has-text-weight-bold has-text-dark mb-5">Our Services</h2>
                    <div className="columns is-multiline">
                        <div className="column is-4">
                            <div className="box">
                                <h3 className="title is-4 has-text-danger">Service 1</h3>
                                <p>Description of Service 1 goes here.</p>
                            </div>
                        </div>
                        <div className="column is-4">
                            <div className="box">
                                <h3 className="title is-4 has-text-danger">Service 2</h3>
                                <p>Description of Service 2 goes here.</p>
                            </div>
                        </div>
                        <div className="column is-4">
                            <div className="box">
                                <h3 className="title is-4 has-text-danger">Service 3</h3>
                                <p>Description of Service 3 goes here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & How We Work */}
            <section className="section has-background-white-ter">
                <div className="container">
                    <div className="columns">
                        <div className="column">
                            <h2 className="title is-4 has-text-weight-bold has-text-dark">Our Mission</h2>
                            <p>BuildShift provides simple, effective solutions to streamline your business operations while keeping people first.</p>
                        </div>
                        <div className="column">
                            <h2 className="title is-4 has-text-weight-bold has-text-dark">How We Work</h2>
                            <p>We listen to your needs, build customized solutions, and provide ongoing support to ensure success.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section has-background-white-bis has-text-centered">
                <div className="container">
                    <h2 className="title is-size-2 has-text-weight-bold has-text-dark mb-4">Get in Touch</h2>
                    <p className="mb-4">Ready to take the next step? Contact us today.</p>
                    <a href="tel:701-361-8401" className="button is-danger is-medium">CALL NOW</a>
                </div>
            </section>
        </div>
    );
};

export default LandingPageBody;
