require 'net/http'

class PhotoshopConv
  
  DEFAULT_HOST = '192.168.8.202'
  DEFAULT_PORT = 3030
  
  def initialize(host_ = DEFAULT_HOST, port_ = DEFAULT_PORT)
    @host = host_
    @port = port_
  end
  
  def post(url, data)
    url = URI.parse(url)
    req = Net::HTTP::Post.new(url.path)
    req.set_form(data, "multipart/form-data")
    
    res = Net::HTTP.new(url.host, url.port).start do |http|
      http.read_timeout = 60000
      http.request(req)
    end
  end

  def convert(file, outfile)
    img = IO.binread(file)
    res = post("http://#{@host}:#{@port}/split_by_layer", [["file", img, { filename: File.basename(file) }]])
    if res.body[0,2] != 'PK'
      raise "Invalid zip file, #{res.body}"
    end
    IO.binwrite(outfile, res.body)
  end

  def self.convert(file, outfile)
    PhotoshopConv.new.convert(file, outfile)
  end
  
end

PhotoshopConv.convert('enemy0306_attack_BC.psd', 'img.zip')
