import url from 'url'

class WaveboxCert {
  static checkCloudfrontCertificateError (wc, targetUrl, err, certificate) {
    if (process.platform !== 'win32') { return false }
    if (err !== 'net::ERR_CERTIFICATE_TRANSPARENCY_REQUIRED') { return false }
    if (!url.parse(targetUrl).hostname.endsWith('.cloudfront.net')) { return false }
    if (certificate.fingerprint !== 'sha256/ahEeiE8YH7VZHFgYS0C3xNpwM3qHFCvfdyVXZK2BlGc=') { return false }
    if (certificate.data !== '-----BEGIN CERTIFICATE-----\nMIIGLDCCBRSgAwIBAgIQApUpeYiqOhba+LAMqCJc6DANBgkqhkiG9w0BAQsFADBE\nMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMR4wHAYDVQQDExVE\naWdpQ2VydCBHbG9iYWwgQ0EgRzIwHhcNMTcxMTIyMDAwMDAwWhcNMTgxMTIxMTIw\nMDAwWjBpMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE\nBxMHU2VhdHRsZTEYMBYGA1UEChMPQW1hem9uLmNvbSBJbmMuMRkwFwYDVQQDDBAq\nLmNsb3VkZnJvbnQubmV0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\no9KMZ+HKu9c/ystE8QBIrDea9ZcPkuG6/gi0O0mp2rRsYCHavM/SyBRyhdIN5A0y\n9tX8l3Ei0M5sTmF0TCXS8Jmctwh+1pmokHotEJU+UtNS9iqW3nsBfsuoaa4a6Uhd\nb4Ciw22jjJq8CX+I3/22Hu9dG/Ndi2HyFx2CurzLMhtBxF2GxNAb/pnTPprsYWAj\nJIfDBU+bu/xhINTeOm2o0FTI6cIXuvgxWqa7OMOIcJwZ2DiAxiw9f4Tkw4i+vS7w\nut7JRRpfZzVf23M7Ks0k+bI0cNJ0FFsImiWrdEJ1FHachQKdM4B/TFPVvzlKvj6N\n3CGs1VfPyp8epW3AYWcPeQIDAQABo4IC8zCCAu8wHwYDVR0jBBgwFoAUJG4rLdBq\nklFRJWkBqppHponnQCAwHQYDVR0OBBYEFDduUSIWNLfd/7A9+56K4fNRBB0kMCsG\nA1UdEQQkMCKCECouY2xvdWRmcm9udC5uZXSCDmNsb3VkZnJvbnQubmV0MA4GA1Ud\nDwEB/wQEAwIFoDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwdwYDVR0f\nBHAwbjA1oDOgMYYvaHR0cDovL2NybDMuZGlnaWNlcnQuY29tL0RpZ2lDZXJ0R2xv\nYmFsQ0FHMi5jcmwwNaAzoDGGL2h0dHA6Ly9jcmw0LmRpZ2ljZXJ0LmNvbS9EaWdp\nQ2VydEdsb2JhbENBRzIuY3JsMEwGA1UdIARFMEMwNwYJYIZIAYb9bAEBMCowKAYI\nKwYBBQUHAgEWHGh0dHBzOi8vd3d3LmRpZ2ljZXJ0LmNvbS9DUFMwCAYGZ4EMAQIC\nMHQGCCsGAQUFBwEBBGgwZjAkBggrBgEFBQcwAYYYaHR0cDovL29jc3AuZGlnaWNl\ncnQuY29tMD4GCCsGAQUFBzAChjJodHRwOi8vY2FjZXJ0cy5kaWdpY2VydC5jb20v\nRGlnaUNlcnRHbG9iYWxDQUcyLmNydDAMBgNVHRMBAf8EAjAAMIIBBAYKKwYBBAHW\neQIEAgSB9QSB8gDwAHYAu9nfvB+KcbWTlCOXqpJ7RzhXlQqrUugakJZkNo4e0YUA\nAAFf4RRGUQAABAMARzBFAiBYd8E/jm2edsDB3L+Y7DtQ5LFIMqRufOgZWcJK80Ui\n+gIhALvajjPRGQYpp+I6bc4jdCF+x0E0bKzB9RVgRS5Ndr7uAHYAh3W/51l8+IxD\nmV+9827/Vo1HVjb/SrVgwbTq/16ggw8AAAFf4RRGgAAABAMARzBFAiBpkGnFG/Xi\nSjpKgyowScd+3th9IQ1JC2bq/oAADAGb/AIhAOU3b4N9MTl9RuyVVHxyVmEl687S\nL//qmx0X7qMp5ae6MA0GCSqGSIb3DQEBCwUAA4IBAQBJ8o7NMkRnn1/vMsT5+bD2\nKSYXy4oQPcPsVrJv6g11QwwRyVlF10pHMKDb7FXSnWT/hax/ELEUfjTGxH7hh3aK\nnmzmNaF8fT4+KnfYki2OwESF2T+PXCJrXdv4sx7CpWE0JQxTLQFP4VoOvtujt03m\nMInt4Y/cXtDKWN5vD5lekqRm35DF1dYtHb7fqmtee1EDkOhh+agWAUH4DeMiLH6T\ncVgnwNwG2q1a870hvlLotQpCyM7TbsSSPlrDGk2hqeqGPEyxk6Zl79epEktTxHpa\nbLweTBhYzpW1XfNK8uzOFxY0HMtBIpwlPcjuNgMKoS0N3S/7MeRK1bWR5zy7iPGc\n-----END CERTIFICATE-----\n') { return false }

    return true
  }

  static handleCertificateError (evt, wc, targetUrl, err, certificate, callback) {
    // Manually validate the cloudfront certificate. Work-around for https://github.com/electron/electron/issues/11860
    // Sample failure cases:
    // https://secure.helpscout.net/members/login/
    // https://d1ux84wfod9ezj.cloudfront.net/efu/upload/b29cce99adc0b3ebee39ce0f868f0c65.jpg
    if (this.checkCloudfrontCertificateError(wc, targetUrl, err, certificate)) {
      evt.preventDefault()
      const res = true
      return callback(res)
    }
  }
}

export default WaveboxCert
